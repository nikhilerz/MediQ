import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, Droplet, ArrowRight, MessageCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const slogans = [
        "Predict Early. Live Better.",
        "Smart Health, Simplified.",
        "Your Personal Health Intelligence.",
        "Quick Insights. Better Care.",
        "Where Data Meets Diagnosis."
    ];

    const [sloganIndex, setSloganIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSloganIndex((prev) => (prev + 1) % slogans.length);
        }, 2000); // 1s viewing + animation time = total cycle. User asked for 1s viewing, let's try 2s total for comfort or 1500ms.
        return () => clearInterval(timer);
    }, [slogans.length]);

    const features = [
        {
            title: 'Diabetes Prediction',
            desc: 'Analyze risk factors like Glucose, BMI, and Age.',
            icon: Activity,
            path: '/diabetes',
            color: 'bg-blue-50/10 text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-400/20'
        },
        {
            title: 'Heart Disease',
            desc: 'Assess cardiovascular health using vital metrics.',
            icon: Heart,
            path: '/heart',
            color: 'bg-red-50/10 text-red-600 dark:text-red-400',
            border: 'border-red-100 dark:border-red-400/20'
        },
        {
            title: 'Kidney Health',
            desc: 'Check kidney function indicators.',
            icon: Droplet,
            path: '/kidney',
            color: 'bg-teal-50/10 text-teal-600 dark:text-teal-400',
            border: 'border-teal-100 dark:border-teal-400/20'
        },
        {
            title: 'AI Assistant',
            desc: 'Chat with our AI for general health queries.',
            icon: MessageCircle,
            path: '/assistant',
            color: 'bg-purple-50/10 text-purple-600 dark:text-purple-400',
            border: 'border-purple-100 dark:border-purple-400/20'
        },
        {
            title: 'Upload Report',
            desc: 'Upload PDF/Image reports for AI Analysis.',
            icon: Upload,
            path: '/upload',
            color: 'bg-orange-50/10 text-orange-600 dark:text-orange-400',
            border: 'border-orange-100 dark:border-orange-400/20'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center mb-16 px-4">
                <div className="h-10 mb-4 flex justify-center items-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={sloganIndex}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm"
                        >
                            {slogans[sloganIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
                    Your Personal <span className="text-secondary">Health Companion</span>
                </h1>
                <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
                    Advanced disease prediction and health monitoring powered by artificial intelligence.
                    Get instant insights and personalized recommendations.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/assistant" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all flex items-center gap-2">
                        Talk to AI Assistant <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={feature.path} className={`block p-6 rounded-2xl border ${feature.border} bg-background hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full`}>
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-text-base mb-2">{feature.title}</h3>
                            <p className="text-muted mb-4">{feature.desc}</p>
                            <div className="flex items-center text-sm font-semibold text-text-base">
                                Try Now <ArrowRight size={16} className="ml-1" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
