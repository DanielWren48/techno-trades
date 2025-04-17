import { Icons } from '@/components/shared';
import useProductStore from '@/hooks/useProductStore';
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom';

const STEPS = [
    {
        name: 'Details',
        url: 'details',
        icon: Icons.post
    },
    {
        name: 'Discount',
        url: 'discount',
        icon: Icons.discount
    },
    {
        name: 'Description',
        url: 'description',
        icon: Icons.text
    },
    {
        name: 'Images',
        url: 'images',
        icon: Icons.media
    },
    {
        name: 'Overview',
        url: 'overview',
        icon: Icons.file
    },
];

export const ProductCreateSteps = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab') || 'details';
    const currentStepIndex = STEPS.findIndex(step => step.url === currentTab);
    const { productData } = useProductStore();

    const navigateToStep = (stepUrl: string, stepIndex: number) => {
        if (stepIndex <= currentStepIndex || hasRequiredDataForStep(stepIndex)) {
            navigate(`/dashboard/new-product?tab=${stepUrl}`);
        }
    };

    const hasRequiredDataForStep = (stepIndex: number) => {
        if (!productData) {
            return stepIndex === 0;
        }

        switch (stepIndex) {
            case 0: // Details - always accessible
                return true;
            case 1: // Discount - require basic product details
                return !!(productData.name && productData.brand && productData.price);
            case 2: // Description - require discount info to be set (even if not discounted)
                return !!(productData.isDiscounted !== undefined);
            case 3: // Images - require description to be set
                return !!(productData.description);
            case 4: // Overview - require images to be uploaded
                return !!(productData.image);
            default:
                return false;
        }
    };

    return (
        <ol className='rounded-md bg-white lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200'>
            {STEPS.map((step, i) => {
                const isCurrent = currentTab === step.url;
                const isCompleted = i < currentStepIndex;
                const isClickable = i <= currentStepIndex || hasRequiredDataForStep(i);
                const Icon = step.icon;

                return (
                    <li
                        key={step.name}
                        className={cn(
                            'relative overflow-hidden lg:flex-1',
                            isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
                        )}
                        onClick={() => isClickable && navigateToStep(step.url, i)}
                    >
                        <div>
                            <span
                                className={cn(
                                    'absolute left-0 top-0 h-full w-1 bg-zinc-400 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full',
                                    {
                                        'bg-zinc-700': isCurrent,
                                        'bg-primary': isCompleted,
                                    }
                                )}
                                aria-hidden='true'
                            />

                            <span
                                className={cn(
                                    i !== 0 ? 'lg:pl-9' : '',
                                    'flex items-center px-6 py-4 text-sm font-medium',
                                    isClickable ? 'hover:bg-gray-50' : ''
                                )}>
                                <Icon />
                                <span className='ml-1 h-full mt-0.5 flex min-w-0 flex-col justify-center'>
                                    <span
                                        className={cn('text-sm font-semibold text-zinc-700', {
                                            'text-primary': isCompleted,
                                            'text-zinc-700': isCurrent,
                                        })}>
                                        {step.name}
                                    </span>
                                </span>
                            </span>

                            {i !== 0 ? (
                                <div className='absolute inset-0 hidden w-3 lg:block'>
                                    <svg
                                        className='h-full w-full text-gray-300'
                                        viewBox='0 0 12 82'
                                        fill='none'
                                        preserveAspectRatio='none'>
                                        <path
                                            d='M0.5 0V31L10.5 41L0.5 51V82'
                                            stroke='currentcolor'
                                            vectorEffect='non-scaling-stroke'
                                        />
                                    </svg>
                                </div>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
};

export default ProductCreateSteps;