import { showPerPage, sortCategories } from '@/constants/idnex';
import { IUser, Product } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SortingState {
    isChecked: boolean;
    selectedSort: string;
    selectedShowPerPage: number;
    setSort: (value: string) => void;
    toggleCheckbox: () => void;
    setShowPerPage: (value: number) => void;
}

interface BrandsFilteringState {
    selectedBrands: string[];
    toggleBrand: (brand: string) => void;
    setBrands: (brands: string[]) => void;
    removeBrand: (brand: string) => void;
    removeAllBrands: () => void;
}

interface StockFilteringState {
    hideOutOfStock: boolean;
    toggleHideOutOfStock: () => void;
}

interface PriceFilterState {
    min: number;
    max: number;
    debouncedMin: number;
    debouncedMax: number;
    productPriceRange: {
        min: number;
        max: number;
    };
    isInitialized: boolean; // Add flag to track initial setup
}

interface PriceFilterActions {
    setPriceRange: (min: number, max: number) => void;
    setDebouncedPriceRange: (min: number, max: number) => void;
    initializePriceRange: (min: number, max: number) => void;
    resetPriceRange: () => void;
}

const initialState: PriceFilterState = {
    min: 0,
    max: 1200,
    debouncedMin: 0,
    debouncedMax: 1200,
    productPriceRange: {
        min: 0,
        max: 1200
    },
    isInitialized: false
};

export interface PriceRange {
    min: number;
    max: number;
}

interface PriceFilterStoreState {
    selectedRanges: PriceRange[];
    addSelectedRange: (range: PriceRange) => void;
    removeSelectedRange: (min: number, max: number) => void;
    removeAllRanges: () => void;
}

interface RatingFilterStoreState {
    selectedRatings: number[];
    addSelectedRating: (rating: number) => void;
    removeSelectedRating: (rating: number) => void;
    removeAllRatings: () => void;
}

interface CategoryFilterStoreState {
    selectedCategories: string[];
    toggleCategory: (category: string) => void;
    setCategories: (categories: string[]) => void;
    removeCategory: (category: string) => void;
    removeAllCategories: () => void;
}

interface ProductStoreState {
    filteredProducts: null | Product[];
    totalProducts: number;
    setFilteredProducts: (products: Product[]) => void;
    setTotalProducts: (count: number) => void;
}

interface UserStoreState {
    user: null | Partial<IUser>;
    setUserProducts: (user: Partial<IUser>) => void;
}

export const useSorting = create<SortingState>((set) => ({
    isChecked: false,
    selectedSort: sortCategories[0].value,
    selectedShowPerPage: showPerPage[0].value,
    toggleCheckbox: () => set((state) => ({ isChecked: !state.isChecked })),
    setSort: (value) => set(() => ({ selectedSort: value })),
    setShowPerPage: (value) => set(() => ({ selectedShowPerPage: value })),
}));

export const useBrandFilter = create<BrandsFilteringState>((set) => ({
    selectedBrands: [],
    toggleBrand: (brand) =>
        set((state) => ({
            selectedBrands: state.selectedBrands.includes(brand)
                ? state.selectedBrands.filter((selectedBrand) => selectedBrand !== brand)
                : [...state.selectedBrands, brand],
        })),
    setBrands: (brands) => set(() => ({ selectedBrands: brands })),
    removeBrand: (brand) => set((state) => ({
        selectedBrands: state.selectedBrands.filter((selectedBrand) => selectedBrand !== brand),
    })),
    removeAllBrands: () => set(() => ({ selectedBrands: [] })),
}));

export const useStockFiltering = create<StockFilteringState>((set) => ({
    hideOutOfStock: false,
    toggleHideOutOfStock: () =>
        set((state) => ({ hideOutOfStock: !state.hideOutOfStock })),
}));

export const usePriceFilterStore = create<PriceFilterStoreState>((set) => ({
    selectedRanges: [],
    addSelectedRange: (range) => set((state) => ({ selectedRanges: [...state.selectedRanges, range] })),
    removeSelectedRange: (min, max) =>
        set((state) => ({
            selectedRanges: state.selectedRanges.filter((range) => range.min !== min || range.max !== max),
        })),
    removeAllRanges: () => set(() => ({ selectedRanges: [] })),
}));

export const usePriceFilter = create<PriceFilterState & PriceFilterActions>((set) => ({
    ...initialState,

    setPriceRange: (min: number, max: number) =>
        set((state) => ({
            min,
            max,
        })),

    setDebouncedPriceRange: (min: number, max: number) =>
        set(() => ({
            debouncedMin: min,
            debouncedMax: max,
        })),

    initializePriceRange: (min: number, max: number) =>
        set((state) => {
            if (!state.isInitialized) {
                return {
                    productPriceRange: { min, max },
                    min,
                    max,
                    debouncedMin: min,
                    debouncedMax: max,
                    isInitialized: true
                };
            }
            return state;
        }),

    resetPriceRange: () =>
        set((state) => ({
            min: state.productPriceRange.min,
            max: state.productPriceRange.max,
            debouncedMin: state.productPriceRange.min,
            debouncedMax: state.productPriceRange.max,
        })),
}));

export const useRatingFilterStore = create<RatingFilterStoreState>((set) => ({
    selectedRatings: [],
    addSelectedRating: (rating) => set((state) => ({ selectedRatings: [...state.selectedRatings, rating] })),
    removeSelectedRating: (rating) =>
        set((state) => ({ selectedRatings: state.selectedRatings.filter((selectedRating) => selectedRating !== rating) })),
    removeAllRatings: () => set(() => ({ selectedRatings: [] })),
}));

export const useCategoryFilter = create<CategoryFilterStoreState>((set) => ({
    selectedCategories: [],
    categoryCounts: {},
    toggleCategory: (category) =>
        set((state) => ({
            selectedCategories: state.selectedCategories.includes(category)
                ? state.selectedCategories.filter((selectedCategory) => selectedCategory !== category)
                : [...state.selectedCategories, category],
        })),
    setCategories: (categories) => set(() => ({ selectedCategories: categories })),
    removeCategory: (category) => set((state) => ({
        selectedCategories: state.selectedCategories.filter((selectedCategory) => selectedCategory !== category),
    })),
    removeAllCategories: () => set(() => ({ selectedCategories: [] })),
}));

export const useProductStore = create<ProductStoreState>((set) => ({
    filteredProducts: null,
    totalProducts: 0,
    setFilteredProducts: (products) => set({ filteredProducts: products }),
    setTotalProducts: (count) => set({ totalProducts: count }),
}));

export const useUserStore = create<UserStoreState>()(
    persist(
        (set) => ({
            user: null,
            setUserProducts: (user) => set({ user: user }),
        }),
        {
            name: 'user',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
