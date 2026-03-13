import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from '@/app/layout'
import HomePage from '@/app/page'
import PrivacyPage from '@/app/privacy/page'
import TermsPage from '@/app/terms/page'
import { useDocumentMeta } from '@/lib/useDocumentMeta'
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';

function NotFoundPage() {
    useDocumentMeta({
        title: 'Not Found - Shankarya',
        description: 'The requested page was not found.'
    })

    return (
        <div className="min-h-screen bg-void text-paper p-8 md:p-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif mb-8">Page Not Found</h1>
                <p className="text-gray-300 mb-8">
                    The page you requested does not exist.
                </p>
                <Link to="/" className="text-signal underline underline-offset-4">
                    Return Home
                </Link>
            </div>
        </div>
    )
}

export default function App() {

    useEffect(() => {
        sdk.actions.ready();
    }, []);

    return (
        <BrowserRouter>
            <RootLayout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </RootLayout>
        </BrowserRouter>
    )
}
