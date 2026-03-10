import React, { useState } from 'react';
import axios from 'axios';
import { Droplet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const KidneyPage = () => {
    const [formData, setFormData] = useState({
        age: '', blood_pressure: '', specific_gravity: '', albumin: '', sugar: '',
        red_blood_cells: '', pus_cell: '', pus_cell_clumps: '', bacteria: '',
        blood_glucose_random: '', blood_urea: '', serum_creatinine: '', sodium: '',
        potassium: '', haemoglobin: '', packed_cell_volume: '', white_blood_cell_count: '',
        red_blood_cell_count: '', hypertension: '', diabetes_mellitus: '',
        coronary_artery_disease: '', appetite: '', peda_edema: '', aanemia: ''
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
            const response = await axios.post('http://localhost:8000/api/predict/kidney', payload);
            setResult(response.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex p-3 rounded-xl bg-teal-50/10 text-teal-600 dark:text-teal-400 mb-4"><Droplet size={32} /></div>
                <h1 className="text-3xl md:text-4xl mb-4 text-text-base">Kidney Health</h1>
                <p className="text-muted">Enter renal health metrics.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {Object.keys(formData).map(key => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-muted mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                                    <input type="number" name={key} value={formData[key]} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-background border border-gray-100 dark:border-white/10 text-text-base text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                </div>
                            ))}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex justify-center items-center gap-2 shadow-lg">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Predict Kidney Health'}
                        </button>
                    </form>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {result ? (
                        <div className={`h-full p-6 rounded-2xl border ${result.prediction === 'Positive' ? 'bg-red-50/10 border-red-500/20' : 'bg-green-50/10 border-green-500/20'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                {result.prediction === 'Positive'
                                    ? <AlertCircle className="text-red-600" size={28} />
                                    : <CheckCircle className="text-green-600" size={28} />
                                }
                                <h3 className="text-xl font-bold text-text-base leading-tight">{result.prediction}</h3>
                            </div>
                            <div className="bg-surface p-4 rounded-xl mb-4 border border-gray-100 dark:border-white/5 shadow-sm">
                                <p className="text-sm text-muted uppercase font-semibold mb-1">Risk Level</p>
                                <p className="text-lg font-bold text-text-base">{result.risk_level}</p>
                            </div>
                            <h4 className="font-semibold text-text-base mb-2">Recommendations</h4>
                            <ul className="text-sm space-y-2 text-muted">{result.recommendations.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span> {r}</li>)}</ul>
                        </div>
                    ) : (
                        <div className="h-full bg-surface rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center p-8 text-center text-muted">
                            <Droplet size={48} className="mb-4 opacity-50" />
                            <p>Results will appear here after analysis.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default KidneyPage;
