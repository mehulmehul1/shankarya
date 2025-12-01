import { create } from 'zustand'

interface AppState {
    loading: boolean
    setLoading: (status: boolean) => void

    // Existing logic
    cursor: { x: number; y: number; hoverState: 'default' | 'pointer' }

    // NEW: Text to display next to cursor (e.g. "VIEW ON ZORA")
    cursorText: string
    setCursorText: (text: string) => void
}

export const useStore = create<AppState>((set) => ({
    loading: true,
    setLoading: (loading) => set({ loading }),

    cursor: { x: 0, y: 0, hoverState: 'default' },

    // NEW
    cursorText: "",
    setCursorText: (cursorText) => set({ cursorText }),
}))