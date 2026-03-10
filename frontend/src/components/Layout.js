import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Heart, Droplet, MessageCircle, Menu, X, Upload } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: null },
        { name: 'Diabetes', path: '/diabetes', icon: Activity },
        { name: 'Heart', path: '/heart', icon: Heart },
        { name: 'Kidney', path: '/kidney', icon: Droplet },
        { name: 'Upload', path: '/upload', icon: Upload },
        { name: 'Assistant', path: '/assistant', icon: MessageCircle },
    ];

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {/* Navigation */}
            <nav className="bg-background border-b border-gray-100 dark:border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                    <Activity size={20} />
                                </div>
                                <span className="text-xl font-heading font-bold text-primary">MediQ</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2
                      ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted hover:bg-surface hover:text-primary'
                                            }`}
                                    >
                                        {item.icon && <item.icon size={16} />}
                                        {item.name}
                                    </Link>
                                );
                            })}

                            <div className="pl-4 ml-4 border-l border-gray-100 dark:border-white/10">
                                <ThemeToggle />
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-background border-b border-gray-100 dark:border-white/5">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3
                    ${location.pathname === item.path
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted hover:bg-surface'
                                        }`}
                                >
                                    {item.icon && <item.icon size={20} />}
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-background border-t border-gray-100 dark:border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-muted text-sm">
                    <p>© 2026 MediQ. AI-Powered Medical Assistance.</p>
                    <p className="mt-1">Disclaimer: Not a substitute for professional medical advice.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
