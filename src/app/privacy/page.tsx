import { useDocumentMeta } from '@/lib/useDocumentMeta'

export default function PrivacyPage() {
    useDocumentMeta({
        title: 'Privacy Policy - Shankarya',
        description: 'Privacy Policy for Shankarya WebGPU Experience'
    })

    return (
        <div className="min-h-screen bg-void text-paper p-8 md:p-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-serif mb-8">Privacy Policy</h1>

                <div className="space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Information We Collect</h2>
                        <p>
                            Shankarya does not collect any personal information. We use local storage only for
                            enhancing your browsing experience with preferences and settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">WebGPU & Canvas Data</h2>
                        <p>
                            We use WebGPU and Canvas for rendering graphics on your device. All rendering
                            happens locally in your browser. We do not collect or transmit any graphics data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Third-Party Services</h2>
                        <p>
                            When accessed as a Farcaster or Base Mini-App, we may receive limited
                            context from the platform (such as user ID) for integration purposes only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Cookies</h2>
                        <p>
                            We do not use tracking cookies. Essential cookies may be used for
                            technical functionality of the application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Data Security</h2>
                        <p>
                            We implement appropriate security measures to protect any data you provide.
                            However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif mb-3 text-signal">Contact</h2>
                        <p>
                            For any privacy-related questions, please contact us through the Farcaster or Base app,
                            or visit our website.
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
