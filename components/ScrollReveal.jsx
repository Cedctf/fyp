import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import styles from './ScrollReveal.module.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom bottom',
    wordAnimationEnd = 'bottom bottom',
    scrub = true,
    stagger = 0.05
}) => {
    const containerRef = useRef(null);

    // Recursively wrap words in span.word
    const splitChildren = (nodes) => {
        return React.Children.map(nodes, (child) => {
            // Handle strings
            if (typeof child === 'string') {
                return child.split(/(\s+)/).map((word, index) => {
                    // Preserve whitespace but don't wrap it if it's just spaces
                    if (word.match(/^\s+$/)) return word;
                    return (
                        <span className={styles.word} key={index}>
                            {word}
                        </span>
                    );
                });
            }

            // Handle React Elements (e.g. <span className="text-blue-500">...</span>)
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                    children: splitChildren(child.props.children)
                });
            }

            return child;
        });
    };

    const processedChildren = useMemo(() => splitChildren(children), [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        // 1. Container Rotation
        gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top bottom',
                    end: rotationEnd,
                    scrub: scrub
                }
            }
        );

        // 2. Word Animation
        const wordElements = el.querySelectorAll(`.${styles.word}`);

        gsap.fromTo(
            wordElements,
            { opacity: baseOpacity, willChange: 'opacity, filter' },
            {
                ease: 'none',
                opacity: 1,
                stagger: stagger,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top bottom-=20%',
                    end: wordAnimationEnd,
                    scrub: scrub,
                    toggleActions: scrub ? undefined : "play none none reverse"
                }
            }
        );

        if (enableBlur) {
            gsap.fromTo(
                wordElements,
                { filter: `blur(${blurStrength}px)` },
                {
                    ease: 'none',
                    filter: 'blur(0px)',
                    stagger: stagger,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top bottom-=20%',
                        end: wordAnimationEnd,
                        scrub: scrub,
                        toggleActions: scrub ? undefined : "play none none reverse"
                    }
                }
            );
        }

        return () => {
            // Be careful not to kill other ScrollTriggers on the page if they are not related to this component
            // Using ScrollTrigger.getAll() might be too aggressive if multiple instances exist or other components use it.
            // Better to track the triggers created here. However, to stick to the requested structure:
            // We will rely on React's cleanup which helps. 
            // ideally we should capture the instances returned by gsap.fromTo/to
            // But for now, let's trust the logic provided or clean up by trigger context if possible.
            // The snippet provided: ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            // This is dangerous for a component as it kills ALL triggers on the page on unmount!
            // I will only kll triggers associated with this element.
            const triggers = ScrollTrigger.getAll().filter(t => t.trigger === el || (t.trigger && el.contains(t.trigger)));
            triggers.forEach(t => t.kill());
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength, processedChildren, scrub, stagger]);

    return (
        <div ref={containerRef} className={`${styles.scrollReveal} ${containerClassName}`}>
            <p className={`${styles.scrollRevealText} ${textClassName}`}>{processedChildren}</p>
        </div>
    );
};

export default ScrollReveal;
