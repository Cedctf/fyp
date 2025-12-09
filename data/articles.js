export const ARTICLES = [
    {
        id: 1,
        title: "Understanding Dengue: The Silent Threat",
        excerpt: "Dengue fever is a mosquito-borne tropical disease caused by the dengue virus. Learn about the symptoms, transmission, and why it's becoming a global concern.",
        category: "Education",
        date: "Dec 08, 2025",
        readTime: "5 min read",
        imageGradient: "from-blue-400 to-purple-500",
        image: "/blog/blog5.jpeg",
        featured: true,
        content: (
            <>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Dengue fever, often termed "breakbone fever" due to the severe joint and muscle pain it causes, is a mosquito-borne tropical disease caused by the dengue virus. It is transmitted primarily by the Aedes aegypti mosquito, a species that has adapted remarkably well to urban environments. As global temperatures rise and urbanization accelerates, the reach of these mosquitoes is expanding, bringing the threat of dengue to new regions and populations.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">Transmission and Vector Control</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    The virus is not spread directly from person to person. Instead, it relies on a vector—the mosquito—to complete its transmission cycle. When a female mosquito bites an infected person, it ingests the virus. After an incubation period, the mosquito becomes capable of transmitting the virus to healthy individuals through subsequent bites. This cycle makes vector control the most effective method currently available for preventing outbreaks. Eliminating standing water where mosquitoes breed, using screens on windows and doors, and applying insect repellent are critical preventive measures.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">The Global Impact</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Once confined to Southeast Asia, dengue has now spread to over 100 countries, putting nearly half of the world's population at risk. The World Health Organization estimates that 390 million dengue infections occur each year. The economic burden is staggering, costing billions in healthcare expenses and lost productivity. Beyond the numbers, the human cost is immesurable, with severe cases leading to hospitalization and, in tragic instances, death.
                </p>
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 my-8">
                    <h4 className="font-bold text-blue-900 mb-2">Key Takeaway</h4>
                    <p className="text-blue-800">
                        Understanding the lifecycle of the mosquito and the transmission of the virus is the first step in community defense. Awareness drives action, and collective action is our best shield against this silent threat.
                    </p>
                </div>
            </>
        )
    },
    {
        id: 2,
        title: "5 Essential Prevention Tips for Your Home",
        excerpt: "Simple yet effective steps you can take today to mosquito-proof your home and protect your family from dengue.",
        category: "Prevention",
        date: "Dec 05, 2025",
        readTime: "3 min read",
        imageGradient: "from-green-400 to-teal-500",
        image: "/blog/blog1.jpeg",
        featured: false,
        content: (
            <>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Your home should be your sanctuary, not a breeding ground for disease-carrying mosquitoes. The Aedes mosquito, the primary vector for dengue, prefers to breed in clean, stagnant water often found in and around our homes. By taking a few proactive steps, you can significantly reduce the risk of infection for you and your family.
                </p>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">1</span>
                        <div>
                            <strong className="block text-gray-900">Eliminate Standing Water</strong>
                            <span className="text-gray-600">Inspect flower vases, pet bowls, and plant saucers daily. Scrub the insides of containers to remove mosquito eggs, which can stick to surfaces.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">2</span>
                        <div>
                            <strong className="block text-gray-900">Secure Your Screens</strong>
                            <span className="text-gray-600">Ensure windows and doors have tight-fitting screens without holes. This physical barrier is your first line of defense against flying insects.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">3</span>
                        <div>
                            <strong className="block text-gray-900">Natural Repellents</strong>
                            <span className="text-gray-600">Consider keeping mosquito-repelling plants like citronella, lemongrass, or lavender near entryways. While not a standalone solution, they can help deter pests.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">4</span>
                        <div>
                            <strong className="block text-gray-900">Weekly "Search and Destroy"</strong>
                            <span className="text-gray-600">Dedicate 10 minutes once a week to walk around your property specifically looking for potential breeding sites—clogged gutters, old tires, or buckets.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-1">5</span>
                        <div>
                            <strong className="block text-gray-900">Coverage is Key</strong>
                            <span className="text-gray-600">During outbreaks, wear long-sleeved shirts and pants, and use EPA-registered insect repellents when spending time outdoors.</span>
                        </div>
                    </li>
                </ul>
            </>
        )
    },
    {
        id: 3,
        title: "Early Warning Signs You Shouldn't Ignore",
        excerpt: "High fever, severe headache, and joint pain. Knowing the early symptoms can save lives. Here's what to look out for.",
        category: "Symptoms",
        date: "Nov 28, 2025",
        readTime: "4 min read",
        imageGradient: "from-orange-400 to-red-500",
        image: "/blog/blog2.jpeg",
        featured: false,
        content: (
            <>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Dengue is a tricky disease. For many, it starts like a typical flu—a sudden fever and fatigue. However, distinguishing dengue from a common viral infection is crucial because without proper care, it can escalate into severe dengue (also known as dengue hemorrhagic fever), which is a medical emergency.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">The Classic Triad</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Ideally, you should seek medical advice if you experience a high fever (40°C/104°F) accompanied by two of the following symptoms: severe headache, pain behind the eyes, muscle and joint pain, nausea, vomiting, or swollen glands.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(87,17,17)] mt-8 mb-4">Warning Signs of Severe Dengue</h3>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500 mb-8">
                    <p className="mb-4 text-red-900 font-semibold">
                        Severe dengue usually occurs 3–7 days after illness onset, often around the time the fever drops (defervescence). Watch closely for these signs:
                    </p>
                    <ul className="list-disc list-inside text-red-800 space-y-2">
                        <li>Severe abdominal pain</li>
                        <li>Persistent vomiting</li>
                        <li>Rapid breathing</li>
                        <li>Bleeding gums or nosebleeds</li>
                        <li>Fatigue or restlessness</li>
                        <li>Blood in vomit or stool</li>
                    </ul>
                    <p className="mt-4 text-sm text-red-700 italic">
                        *If you or a family member exhibits any of these warning signs, go to an emergency room immediately.*
                    </p>
                </div>
            </>
        )
    },
    {
        id: 4,
        title: "The Future of Dengue Prediction",
        excerpt: "How AI and machine learning are revolutionizing the way we predict and manage outbreaks before they happen.",
        category: "Tech & Innovation",
        date: "Nov 20, 2025",
        readTime: "6 min read",
        imageGradient: "from-indigo-400 to-purple-600",
        image: "/blog/blog3.jpeg",
        featured: false,
        content: (
            <>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Traditionally, dengue response has been reactive—waiting for case numbers to rise before deploying fumigation trucks or launching public health campaigns. But what if we could predict an outbreak weeks, or even months, before it happens? Thanks to Artificial Intelligence (AI) and Machine Learning (ML), this is becoming a reality.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">Data-Driven Defense</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Modern prediction models go beyond simple case counting. They ingest vast amounts of diverse data: satellite imagery showing vegetation and water bodies, real-time meteorological data (rainfall, humidity, temperature), and even social media trends reporting mosquito nuisances. By analyzing these complex datasets, ML algorithms can identify patterns invisible to the human eye.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">Preventive vs. Reactive</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    The shift is profound. Instead of "chasing the virus," health authorities can now implement "precision public health." Resources can be allocated to specific neighborhoods predicted to be hotspots. This not only saves money but, more importantly, saves lives by engaging communities before transmission chains establish themselves. As technology advances, our ability to forecast these outbreaks will arguably become our most potent weapon in the fight against dengue.
                </p>
            </>
        )
    },
    {
        id: 5,
        title: "Community Action: Fighting Dengue Together",
        excerpt: "Why community-led initiatives are the most powerful weapon against outbreaks. Case studies from successful campaigns.",
        category: "Community",
        date: "Nov 15, 2025",
        readTime: "4 min read",
        imageGradient: "from-pink-400 to-rose-500",
        image: "/blog/blog4.jpeg",
        featured: false,
        content: (
            <>
                <p className="mb-6 leading-relaxed text-gray-700">
                    While technology and government policies play vital roles, the battle against dengue is ultimately won or lost in our backyards and neighborhoods. Community engagement isn't just a support mechanism; it's the engine of sustainable prevention.
                </p>
                <h3 className="text-2xl font-serif font-bold text-[rgb(27,55,121)] mt-8 mb-4">The Power of the Collective</h3>
                <p className="mb-6 leading-relaxed text-gray-700">
                    Mosquitoes don't respect property lines. A single unkempt yard with stagnant water can threaten an entire street. This is why individual action, while necessary, is insufficient. Community-led initiatives—like neighborhood clean-up drives, educational workshops in local schools, and "block captain" systems for monitoring breeding sites—create a web of protection that covers everyone.
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Education</h4>
                        <p className="text-sm text-gray-600">Empowering residents with knowledge about the mosquito lifecycle transforms them from passive victims to active defenders.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-2">Ownership</h4>
                        <p className="text-sm text-gray-600">When communities design their own solutions, compliance rates soar. Local solutions for local problems act faster and stick longer.</p>
                    </div>
                </div>
            </>
        )
    }
];
