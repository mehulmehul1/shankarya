import { useDocumentMeta } from '@/lib/useDocumentMeta'

export default function TermsPage() {
    useDocumentMeta({
        title: 'Terms of Service - Shankarya',
        description: 'Terms of Service for Shankarya WebGPU Experience'
    })

    return (
        <div className="min-h-screen bg-void text-paper p-8 md:p-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif mb-8">Terms of Service</h1>

                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Acceptance of Terms</h2>
                        <p>
                            By accessing or using Shankarya, you agree to be bound by these Terms of Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Use License</h2>
                        <p>
                            Permission is granted to use Shankarya for personal, non-commercial purposes.
                            You may not modify, copy, distribute, or reverse engineer the application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">WebGPU Requirements</h2>
                        <p>
                            Shankarya requires WebGPU support for optimal experience. Performance may vary
                            based on your device's GPU capabilities. We are not responsible for hardware
                            limitations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Mini-App Integration</h2>
                        <p>
                            When used as a Farcaster or Base Mini-App, additional platform-specific
                            terms and conditions may apply. Please refer to the respective platform's policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Content</h2>
                        <p>
                            All content including images, videos, and code is protected by copyright laws.
                            You may not use content for commercial purposes without explicit permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Disclaimer</h2>
                        <p>
                            Shankarya is provided "as is" without warranties of any kind. We do not guarantee
                            that the application will be uninterrupted or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Limitation of Liability</h2>
                        <p>
                            In no event shall Shankarya or its creators be liable for any indirect,
                            incidental, special, or consequential damages arising from use of this application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of the
                            application constitutes acceptance of any changes.
                        </p>
                    </section>

                    <p className="text-sm text-gray-500 mt-12">
                        Last updated: January 2026
                    </p>
                </div>
            </div>
        </div>
    )
}
