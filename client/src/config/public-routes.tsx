import { JSX } from 'react';
import { Cart, CkeckoutSuccess, Deals, Explore, Home, NotFound, PopularBrands, ProductDetails, Checkout, Category } from '@/_root/pages';
import { ProtectedRouteProps } from '@/components/root/ProtectedRoute';
import { ACCOUNT_TYPE } from '@/types';

export interface PublicRoute {
  path: string;
  outlet: JSX.Element;
  isProtected?: boolean;
  allowedAccountTypes?: ACCOUNT_TYPE[];
  protectedRouteProps?: ProtectedRouteProps;
}

const publicRoutes: PublicRoute[] = [
  {
    path: '/',
    outlet: <Home />,
  },
  {
    path: '/category/:parentSlug',
    outlet: <Category />,
  },
  {
    path: '/category/:parentSlug/:childSlug',
    outlet: <Category />,
  },
  {
    path: '/explore',
    outlet: <Explore />,
  },
  {
    path: '/cart',
    outlet: <Cart />,
  },
  {
    path: '/checkout',
    outlet: <Checkout />,
    isProtected: true,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
  },
  {
    path: '/checkout-success',
    outlet: <CkeckoutSuccess />,
    isProtected: true,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
  },
  {
    path: '/deals',
    outlet: <Deals />,
  },
  {
    path: '/popular-brands',
    outlet: <PopularBrands />,
  },
  {
    path: '/products/:slug',
    outlet: <ProductDetails />,
  },
  {
    path: '*',
    outlet: <NotFound />,
  },
];

export default publicRoutes;