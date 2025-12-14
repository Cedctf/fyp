import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import {
    ArrowLeft, CheckCircle, Image as ImageIcon, Sparkles, PenTool, Upload,
    Bold, Italic, Link as LinkIcon, Quote, List, Type, AlignLeft, Clock, Calendar
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { VideoUploadCard } from "@/components/ui/video-upload-card";
import { cn } from "@/lib/utils";

const CATEGORIES = ["prevention", "symptoms", "education", "tech & innovation", "community"];

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function NewArticlePage() {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        imageUrl: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [stats, setStats] = useState({ words: 0, readTime: 1 });

    useEffect(() => {
        const words = formData.content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const readTime = Math.max(1, Math.ceil(words / 200)); // ~200 words per minute
        setStats({ words, readTime });
    }, [formData.content]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, category: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/education/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                console.error("Submission failed");
                // Ideally show error toast here
            }
        } catch (error) {
            console.error("Error submitting article:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormat = (type) => {
        const textarea = document.getElementById('content');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        let newText = text;
        let newCursorPos = end;

        switch (type) {
            case 'bold':
                newText = `${before}**${selection || 'bold text'}**${after}`;
                newCursorPos = end + 2 + (selection ? 0 : 9); // 9 is length of 'bold text'
                break;
            case 'italic':
                newText = `${before}*${selection || 'italic text'}*${after}`;
                newCursorPos = end + 1 + (selection ? 0 : 11);
                break;
            case 'link':
                newText = `${before}[${selection || 'link text'}](url)${after}`;
                newCursorPos = end + 1 + (selection ? 0 : 9);
                break;
            case 'quote':
                newText = `${before}\n> ${selection || 'quote'}\n${after}`;
                newCursorPos = end + 3 + (selection ? 0 : 5);
                break;
            case 'list':
                newText = `${before}\n- ${selection || 'list item'}${after}`;
                newCursorPos = end + 3 + (selection ? 0 : 9);
                break;
            case 'image':
                newText = `${before}![${selection || 'alt text'}](image-url)${after}`;
                newCursorPos = end + 2 + (selection ? 0 : 8);
                break;
            case 'heading':
                newText = `${before}\n## ${selection || 'Heading'}\n${after}`;
                newCursorPos = end + 4 + (selection ? 0 : 7);
                break;
        }

        setFormData(prev => ({ ...prev, content: newText }));

        // Restore focus and cursor needs to be delayed slightly for React to render
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                type === 'bold' ? start + 2 :
                    type === 'italic' ? start + 1 :
                        type === 'link' ? start + 1 :
                            newCursorPos,
                newCursorPos
            );
        }, 0);
    };

    return (
        <div className="min-h-screen bg-[#FDFCF8] text-[rgb(27,55,121)] font-sans selection:bg-[rgb(27,55,121)]/10 selection:text-[rgb(27,55,121)]">
            <Head>
                <title>Draft New Story - Dengue Education Hub</title>
            </Head>

            <Navbar />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-50/40 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[rgb(27,55,121)]/5 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
            </div>

            <main className="container mx-auto px-4 pt-28 pb-24 relative z-10">
                <div className="mb-10 w-full">
                    <Link href="/education">
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 text-[rgb(27,55,121)]/50 hover:text-[rgb(27,55,121)] transition-colors cursor-pointer text-sm font-medium tracking-wide uppercase"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Hub
                        </motion.span>
                    </Link>
                </div>

                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-xl mx-auto"
                        >
                            <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-xl overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                                <CardContent className="pt-16 pb-12 px-12 text-center relative z-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                        className="w-24 h-24 bg-gradient-to-tr from-[rgb(27,55,121)] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-blue-900/20 shadow-lg"
                                    >
                                        <CheckCircle className="w-12 h-12 text-white" />
                                    </motion.div>
                                    <h2 className="text-4xl font-serif font-medium text-[rgb(27,55,121)] mb-4">Published!</h2>
                                    <p className="text-lg text-[rgb(27,55,121)]/60 mb-10 leading-relaxed">
                                        Your story has been successfully submitted and is now pending review.
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <Link href="/education">
                                            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 hover:text-[rgb(27,55,121)] transition-all duration-300">
                                                Read Articles
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={() => {
                                                setSubmitted(false);
                                                setFormData({ title: '', category: '', excerpt: '', content: '', imageUrl: '' });
                                            }}
                                            className="w-full sm:w-auto h-12 px-8 rounded-full bg-[rgb(27,55,121)] text-white hover:bg-[rgb(20,40,90)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                        >
                                            Write Another
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="w-full"
                        >
                            <motion.div variants={fadeInUp} className="mb-12 w-full">
                                <h1 className="text-5xl md:text-6xl font-serif font-light text-[rgb(27,55,121)] mb-6 tracking-tight">
                                    Craft Your Story
                                </h1>
                                <p className="text-xl text-[rgb(27,55,121)]/50 font-sans leading-relaxed">
                                    Share your insights on dengue prevention and innovation with the world.
                                </p>
                            </motion.div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                                    {/* Left Column: Metadata Sidebar (4.5/12) */}
                                    <motion.div variants={fadeInUp} className="lg:col-span-4 space-y-8">
                                        <Card className="border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-32 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                                            <CardContent className="p-8 space-y-8 relative z-10">
                                                <div className="flex items-center gap-2 text-[rgb(27,55,121)]/40 uppercase tracking-widest text-xs font-bold font-sans">
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Publishing Details</span>
                                                </div>

                                                {/* Category */}
                                                <div className="space-y-3">
                                                    <Label htmlFor="category" className="text-sm font-semibold text-[rgb(27,55,121)]">Category</Label>
                                                    <Select name="category" onValueChange={handleSelectChange} value={formData.category} required>
                                                        <SelectTrigger className="w-full bg-white/60 border-transparent text-[rgb(27,55,121)] focus:ring-0 focus:outline-none h-11 shadow-sm">
                                                            <SelectValue placeholder="Select a topic" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white/90 backdrop-blur-xl border-none shadow-xl">
                                                            {CATEGORIES.map(cat => (
                                                                <SelectItem key={cat} value={cat} className="text-[rgb(27,55,121)] focus:bg-[rgb(27,55,121)]/5 cursor-pointer py-3">
                                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Excerpt */}
                                                <div className="space-y-3">
                                                    <Label htmlFor="excerpt" className="text-sm font-semibold text-[rgb(27,55,121)]">Excerpt</Label>
                                                    <Textarea
                                                        id="excerpt"
                                                        name="excerpt"
                                                        required
                                                        rows={3}
                                                        placeholder="A short summary to hook readers..."
                                                        value={formData.excerpt}
                                                        onChange={handleChange}
                                                        className="bg-white/60 border-transparent text-[rgb(27,55,121)] placeholder:text-[rgb(27,55,121)]/30 focus-visible:ring-0 resize-none shadow-sm transition-colors"
                                                    />
                                                </div>

                                                {/* Image Upload */}
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-semibold text-[rgb(27,55,121)]">Cover Media</Label>
                                                    <VideoUploadCard
                                                        title="Upload Cover"
                                                        description="Drop in your cover image"
                                                        onFileChange={(file) => {
                                                            if (file) {
                                                                // Create a fake URL for the form data
                                                                const url = URL.createObjectURL(file);
                                                                setFormData(prev => ({ ...prev, imageUrl: url }));
                                                            } else {
                                                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <Separator className="bg-[rgb(27,55,121)]/10" />

                                                {/* Actions */}
                                                <div className="pt-2 flex flex-col gap-3">
                                                    <Button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-12 rounded-full bg-[rgb(27,55,121)] text-white hover:bg-[rgb(37,65,140)] shadow-lg hover:shadow-blue-900/20 hover:-translate-y-0.5 transition-all duration-300 font-medium text-base tracking-wide"
                                                    >
                                                        {isSubmitting ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                <span>Publishing...</span>
                                                            </div>
                                                        ) : (
                                                            "Publish Story"
                                                        )}
                                                    </Button>
                                                    <Link href="/education">
                                                        <Button type="button" variant="ghost" className="w-full h-10 rounded-full text-[rgb(27,55,121)]/70 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5">
                                                            Cancel
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Right Column: Main Writing Area (7.5/12) */}
                                    <motion.div variants={fadeInUp} className="lg:col-span-8 space-y-8">

                                        {/* Title Input */}
                                        <div className="relative group">
                                            <Label htmlFor="title" className="sr-only">Article Title</Label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                required
                                                placeholder="Title of your story..."
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none p-0 text-4xl md:text-5xl lg:text-6xl font-serif text-[rgb(27,55,121)] placeholder-[rgb(27,55,121)]/20 focus:ring-0 focus:outline-none leading-tight font-medium"
                                            />
                                            <Separator className="mt-6 bg-[rgb(27,55,121)]/20" />
                                        </div>

                                        {/* Formatting Visual Toolbar */}
                                        <div className="sticky top-24 z-30 transition-all duration-300">
                                            <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-[rgb(27,55,121)]/5">
                                                <button type="button" onClick={() => handleFormat('heading')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Heading">
                                                    <Type className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-[rgb(27,55,121)]/10 mx-1" />
                                                <button type="button" onClick={() => handleFormat('bold')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Bold">
                                                    <Bold className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleFormat('italic')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Italic">
                                                    <Italic className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleFormat('link')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Link">
                                                    <LinkIcon className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-[rgb(27,55,121)]/10 mx-1" />
                                                <button type="button" onClick={() => handleFormat('quote')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Quote">
                                                    <Quote className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleFormat('list')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="List">
                                                    <List className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleFormat('image')} className="p-2 text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 rounded-full transition-colors" title="Image">
                                                    <ImageIcon className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-[rgb(27,55,121)]/10 mx-1" />
                                                <div className="px-3 text-xs font-medium text-[rgb(27,55,121)]/40 flex items-center gap-2">
                                                    <span className="flex items-center gap-1">
                                                        <AlignLeft className="w-3 h-3" /> {stats.words} words
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="relative group min-h-[500px]">
                                            <Label htmlFor="content" className="sr-only">Content</Label>
                                            <Textarea
                                                id="content"
                                                name="content"
                                                required
                                                rows={25}
                                                placeholder="Tell your story..."
                                                value={formData.content}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-2 border-[rgb(27,55,121)] p-6 rounded-xl text-lg md:text-xl leading-relaxed text-[rgb(27,55,121)]/80 placeholder:text-[rgb(27,55,121)]/20 focus-visible:ring-0 resize-y font-sans transition-all"
                                                style={{ minHeight: '600px' }}
                                            />
                                        </div>
                                    </motion.div>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
