import { NewProductSchemaType } from '@/_dashboard/schemas/product'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProductStoreState = {
    productData: NewProductSchemaType | undefined
    activeTab: string
    markdown: string
    completedSteps: Record<string, boolean>
    setProductData: (data: NewProductSchemaType | undefined) => void
    updateProductData: (data: Partial<NewProductSchemaType>) => void
    setActiveTab: (tab: string) => void
    setMarkdown: (content: string) => void
    markStepCompleted: (step: string) => void
    canProceedToStep: (step: string) => boolean
    resetStore: () => void
}

const initialState = {
    productData: undefined,
    activeTab: 'details',
    markdown: '',
    completedSteps: {
        details: false,
        discount: false,
        description: false,
        images: false,
        overview: false
    },
}

const stepRequirements = {
    details: (data: NewProductSchemaType | undefined) => true,
    discount: (data: NewProductSchemaType | undefined) => !!(data?.name && data?.brand && data?.price !== undefined),
    description: (data: NewProductSchemaType | undefined) => !!(data?.isDiscounted !== undefined),
    images: (data: NewProductSchemaType | undefined) => !!(data?.description),
    overview: (data: NewProductSchemaType | undefined) => !!(data?.image)
};

const useProductStore = create<ProductStoreState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setProductData: (data) => set({ productData: data }),

            updateProductData: (data) => set((state) => {
                const updatedData = state.productData
                    ? { ...state.productData, ...data }
                    : data as NewProductSchemaType;

                return { productData: updatedData };
            }),

            setActiveTab: (tab) => set({ activeTab: tab }),

            setMarkdown: (content) => set({ markdown: content }),

            markStepCompleted: (step) => set((state) => ({
                completedSteps: { ...state.completedSteps, [step]: true }
            })),

            canProceedToStep: (step) => {
                const { productData, completedSteps } = get();

                const hasRequiredData = stepRequirements[step as keyof typeof stepRequirements]?.(productData) || false;

                const stepOrder = ['details', 'discount', 'description', 'images', 'overview'];
                const stepIndex = stepOrder.indexOf(step);

                if (stepIndex <= 0) return true; // First step is always accessible

                const previousStep = stepOrder[stepIndex - 1];
                const isPreviousStepCompleted = completedSteps[previousStep];

                return hasRequiredData && isPreviousStepCompleted;
            },
            resetStore: () => set(initialState),
        }),
        {
            name: 'product-creation-storage',
            partialize: (state) => ({
                productData: state.productData,
                activeTab: state.activeTab,
                markdown: state.markdown,
                completedSteps: state.completedSteps,
            }),
        }
    )
)

export default useProductStore