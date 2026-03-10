import React, { useState } from 'react';
import axios from 'axios';
import { Heart, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HeartPage = () => {
    const [formData, setFormData] = useState({
        age: '', sex: '', chest_pain: '', resting_bp: '', cholesterol: '',
        fasting_bs: '', resting_ecg: '', max_heart_rate: '', exercise_angina: '',
        oldpeak: '', slope: '', ca: '', thal: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = Object.fromEntries(
                Object.entries(formData).map(([k, v]) => [k, parseFloat(v) || 0])
            );
            const response = await axios.post('http://localhost:8000/api/predict/heart', payload);
            setResult(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex p-3 rounded-xl bg-red-50/10 text-red-600 dark:text-red-400 mb-4">
                    <Heart size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl mb-4 text-text-base">Heart Disease Prediction</h1>
                <p className="text-muted">Assess cardiovascular health risk factors.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <form onSubmit={handleSubmit} className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'age', label: 'Age' }, { name: 'sex', label: 'Sex (1=M, 0=F)' },
                                { name: 'chest_pain', label: 'Chest Pain (0-3)' }, { name: 'resting_bp', label: 'Resting BP' },
                                { name: 'cholesterol', label: 'Cholesterol' }, { name: 'fasting_bs', label: 'Fasting BS (1/0)' },
                                { name: 'resting_ecg', label: 'Resting ECG (0-2)' }, { name: 'max_heart_rate', label: 'Max HR' },
                                { name: 'exercise_angina', label: 'Ex. Angina (1/0)' }, { name: 'oldpeak', label: 'Oldpeak' },
                                { name: 'slope', label: 'Slope (0-2)' }, { name: 'ca', label: 'Major Vessels (0-3)' },
                                { name: 'thal', label: 'Thal (0-3)' }
                            ].map((field) => (
                                <div key={field.name} className={field.name === 'cholesterol' ? 'col-span-2' : ''}>
                                    <label className="block text-sm font-medium text-text-base mb-1">{field.label}</label>
                                    <input type="number" name={field.name} value={formData[field.name]} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-background border border-gray-100 dark:border-white/10 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Predict Risk'}
                        </button>
                    </form>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {result ? (
                        <div className={`h-full p-6 rounded-2xl border ${result.prediction === 'Positive' ? 'bg-red-50/10 border-red-500/20' : 'bg-green-50/10 border-green-500/20'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                {result.prediction === 'Positive'
                                    ? <AlertCircle className="text-red-600" size={32} />
                                    : <CheckCircle className="text-green-600" size={32} />
                                }
                                <div><h3 className="text-xl font-bold text-text-base">Result: {result.prediction}</h3><p className="text-sm text-muted">Confidence: {(result.probability * 100).toFixed(1)}%</p></div>
                            </div>
                            <div className="bg-surface p-4 rounded-xl mb-4 border border-gray-100 dark:border-white/5 shadow-sm"><p className="text-lg font-bold text-text-base">{result.risk_level} Risk</p></div>
                            <h4 className="font-semibold text-text-base mb-2">Recommendations</h4>
                            <ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="text-sm text-muted flex gap-2"><span className="text-primary">•</span> {r}</li>)}</ul>
                        </div>
                    ) : (
                        <div className="h-full bg-surface rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center text-muted">
                            <Heart size={48} className="mb-4 opacity-50" /><p>Fill form to analyze.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default HeartPage;
