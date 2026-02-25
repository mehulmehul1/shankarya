import { useEffect } from 'react'

interface MetaConfig {
    title: string
    description?: string
}

export function useDocumentMeta({ title, description }: MetaConfig) {
    useEffect(() => {
        document.title = title

        if (!description) return

        let meta = document.querySelector('meta[name="description"]')
        if (!meta) {
            meta = document.createElement('meta')
            meta.setAttribute('name', 'description')
            document.head.appendChild(meta)
        }
        meta.setAttribute('content', description)
    }, [title, description])
}
