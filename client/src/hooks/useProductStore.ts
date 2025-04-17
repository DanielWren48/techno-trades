import { NewProductSchemaType } from '@/_dashboard/schemas/product'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProductStoreState = {
    productData: NewProductSchemaType | undefined
    activeTab: string
    markdown: string
    setProductData: (data: NewProductSchemaType | undefined) => void
    updateProductData: (data: Partial<NewProductSchemaType>) => void
    setActiveTab: (tab: string) => void
    setMarkdown: (content: string) => void
    resetStore: () => void
}

const initialState = {
    productData: undefined,
    activeTab: 'details',
    markdown: '',
}

const useProductStore = create<ProductStoreState>()(
    persist(
        (set) => ({
            ...initialState,

            setProductData: (data) => set({ productData: data }),

            updateProductData: (data) => set((state) => ({
                productData: state.productData
                    ? { ...state.productData, ...data }
                    : data as NewProductSchemaType
            })),

            setActiveTab: (tab) => set({ activeTab: tab }),

            setMarkdown: (content) => set({ markdown: content }),

            resetStore: () => set(initialState),
        }),
        {
            name: 'product-creation-storage',
            partialize: (state) => ({
                productData: state.productData,
                activeTab: state.activeTab,
                markdown: state.markdown,
            }),
        }
    )
)

export default useProductStore