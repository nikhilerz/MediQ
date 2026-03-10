import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setFile(acceptedFiles[0]);
        setError(null);
        setResult(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/analyze-report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setResult(response.data.analysis);
            } else {
                setError(response.data.error || "Analysis failed");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to connect to server. Ensure Backend is running and API Key is set.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <div className="inline-flex p-3 rounded-xl bg-orange-50/10 text-orange-600 dark:text-orange-400 mb-4">
                    <Upload size={32} />
                </div>
                <h1 className="text-3xl md:text-4xl mb-4 text-text-base">Medical Report Analysis</h1>
                <p className="text-muted">Upload your lab reports or prescriptions for AI-powered insights.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 h-64 flex flex-col items-center justify-center
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-white/10 hover:border-primary/50 hover:bg-surface'}`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText size={48} className="text-primary mb-4" />
                                <p className="font-semibold text-text-base">{file.name}</p>
                                <p className="text-sm text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-4 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/10 rounded-lg transition-colors"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-orange-50/10 text-orange-600 dark:text-orange-400 rounded-full mb-4">
                                    <Upload size={24} />
                                </div>
                                <p className="text-lg font-medium text-text-base mb-2">Click or drag file to upload</p>
                                <p className="text-sm text-muted">Supports PDF, JPG, PNG (Max 10MB)</p>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Analyze Report'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50/10 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-500/20">
                            <AlertCircle size={20} />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Result Section */}
                <div>
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-background p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 h-full"
                            >
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                                    <CheckCircle className="text-green-500" size={24} />
                                    <h3 className="text-xl font-bold text-text-base">Analysis Result</h3>
                                </div>
                                <div className="prose prose-sm max-w-none text-text-base">
                                    <div className="whitespace-pre-wrap">{result}</div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full bg-surface rounded-2xl border border-gray-100 dark:border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center text-muted min-h-[300px]">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>AI analysis will appear here after upload.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
