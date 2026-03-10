import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import DiabetesPage from './pages/DiabetesPage';
import HeartPage from './pages/HeartPage';
import KidneyPage from './pages/KidneyPage';
import UploadPage from './pages/UploadPage';
import AssistantPage from './pages/AssistantPage';
import { Toaster } from 'sonner';



function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/diabetes" element={<DiabetesPage />} />
                    <Route path="/heart" element={<HeartPage />} />
                    <Route path="/kidney" element={<KidneyPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/assistant" element={<AssistantPage />} />
                </Routes>
            </Layout>
            <Toaster position="top-right" />
        </Router>
    );
}

export default App;
