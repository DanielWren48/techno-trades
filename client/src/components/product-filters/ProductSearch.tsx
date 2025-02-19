import { Input } from '../ui/input';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useSearchProduct } from '@/api/products/queries';
import { useDebounce } from 'use-debounce';

const ProductSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery] = useDebounce(searchQuery, 500);
    const { data: productsData } = useSearchProduct({ filters: { name: debouncedQuery } });
    const products = productsData?.data?.items;

    return (
        <div className="flex flex-1 flex-col items-center w-full h-20 mb-5 relative gap-[0.05rem]">
            <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className='h-16 px-10 bg-background dark:bg-dark-4 dark:placeholder:text-light-2/80 transform transition duration-500 ease-in-out'
            />
            {products &&
                <ul className="w-full bg-white border-2 rounded-b-xl py-2 text-sm text-gray-700 dark:text-gray-200 z-40 shadow-2xl">
                    {products.map((result) => (
                        <li key={result._id}>
                            <Link className='block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white' to={`/products/${result.slug}`}>
                                <div className='flex items-center justify-between'>
                                    <div className='flex flex-row items-center gap-3'>
                                        <img
                                            className="w-10 h-10 object-scale-down"
                                            src={result.image[0].url}
                                            alt="post"
                                        />
                                        <h1 className='text-base font-medium'>{result.name}</h1>
                                    </div>
                                    <div>
                                        <h1 className=''>Available in: <span className='text-base font-medium capitalize'>{result.category}</span></h1>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
};

export default ProductSearch;