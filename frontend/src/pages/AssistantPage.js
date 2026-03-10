import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, Send, User, Bot, Loader2 } from 'lucide-react';

const AssistantPage = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/api/chat', {
                message: input,
                session_id: 'user-session-1'
            });

            const botMsg = { role: 'assistant', content: response.data.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-background rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex-grow flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-surface/50 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <MessageCircle size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-base">Health Assistant</h1>
                        <p className="text-xs text-muted">Powered by OpenAI & Gemini</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-gray-100 dark:border-white/10 text-primary'}`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface text-text-base border border-gray-100 dark:border-white/10 rounded-tl-none'}`}>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-surface border border-gray-100 dark:border-white/10 text-primary flex items-center justify-center flex-shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-surface border border-gray-100 dark:border-white/10 p-4 rounded-2xl rounded-tl-none">
                                    <Loader2 className="animate-spin text-muted" size={20} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-background">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about symptoms, diseases, or health tips..."
                            className="flex-grow px-4 py-3 rounded-xl bg-background border border-gray-100 dark:border-white/10 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssistantPage;
