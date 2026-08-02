import { create } from 'zustand'

export type ToastKind = 'success' | 'error'

export type ToastItem = {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

type ToastState = {
  items: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (toast) => {
    const id = toast.id ?? crypto.randomUUID()
    set((state) => ({
      items: [...state.items, { ...toast, id }],
    }))
    window.setTimeout(() => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      }))
    }, 4200)
  },
  dismiss: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  clear: () => set({ items: [] }),
}))
