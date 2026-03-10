import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DiabetesPage = () => {
    const [formData, setFormData] = useState({
        pregnancies: '', glucose: '', blood_pressure: '', skin_thickness: '',
        insulin: '', bmi: '', diabetes_pedigree: '', age: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert to floats
            const payload = Object.fromEntries(
                Object.entries(formData).map(([k, v]) => [k, parseFloat(v) || 0])
            );
            const response = await axios.post('http://localhost:8000/api/predict/diabetes', payload);
            setResult(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex p-3 rounded-xl bg-blue-50/10 text-blue-600 dark:text-blue-400 mb-4">
                    <Activity size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl mb-4">Diabetes Prediction</h1>
                <p className="text-muted">Enter collected health metrics to assess diabetes risk.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Form Section */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <form onSubmit={handleSubmit} className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'pregnancies', label: 'Pregnancies' },
                                { name: 'glucose', label: 'Glucose Level' },
                                { name: 'blood_pressure', label: 'Blood Pressure' },
                                { name: 'skin_thickness', label: 'Skin Thickness' },
                                { name: 'insulin', label: 'Insulin' },
                                { name: 'bmi', label: 'BMI' },
                                { name: 'diabetes_pedigree', label: 'Diabetes Pedigree' },
                                { name: 'age', label: 'Age' }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-text-base mb-1">{field.label}</label>
                                    <input
                                        type="number"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 rounded-lg bg-background border border-gray-100 dark:border-white/10 text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Predict Risk'}
                        </button>
                    </form>
                </motion.div>

                {/* Result Section */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {result ? (
                        <div className={`h-full p-6 rounded-2xl border ${result.prediction === 'Positive' ? 'bg-red-50/10 border-red-500/20' : 'bg-green-50/10 border-green-500/20'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                {result.prediction === 'Positive'
                                    ? <AlertCircle className="text-red-600" size={32} />
                                    : <CheckCircle className="text-green-600" size={32} />
                                }
                                <div>
                                    <h3 className="text-xl font-bold text-text-base">Result: {result.prediction}</h3>
                                    <p className="text-sm text-muted">Confidence: {(result.probability * 100).toFixed(1)}%</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-surface p-4 rounded-xl border border-gray-100 dark:border-white/5">
                                    <span className="text-sm font-semibold text-muted uppercase">Risk Level</span>
                                    <p className="text-lg font-bold text-text-base">{result.risk_level}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-text-base mb-2">Recommendations</h4>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-surface rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-muted p-8 text-center transition-all">
                            <Activity size={48} className="mb-4 opacity-50" />
                            <p>Fill out the form to see AI analysis results here.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default DiabetesPage;
