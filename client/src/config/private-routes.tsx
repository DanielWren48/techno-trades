import { JSX } from 'react';
import { Dashboard, Account, Orders, Notifications, Appearance, Favourites, Tables, ProductCreateForm, Categories } from '@/_dashboard/pages';
import { ACCOUNT_TYPE } from '@/types';

export interface dashboardRoutesProps {
  path: string;
  outlet: JSX.Element;
  allowedAccountTypes: ACCOUNT_TYPE[];
  additionalProps: {
    redirectPath?: string;
    [key: string]: any;
  };
}

const dashboardRoutes: dashboardRoutesProps[] = [
  {
    path: '/dashboard',
    outlet: <Dashboard />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF],
    additionalProps: {
      redirectPath: '/dashboard/account/:id',
    },
  },
  {
    path: '/dashboard/account/:id',
    outlet: <Account />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
    additionalProps: {},
  },
  {
    path: '/dashboard/my-orders/:id',
    outlet: <Orders />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
    additionalProps: {},
  },
  {
    path: '/dashboard/notifications/:id',
    outlet: <Notifications />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
    additionalProps: {},
  },
  {
    path: '/dashboard/appearance/:id',
    outlet: <Appearance />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
    additionalProps: {},
  },
  {
    path: '/dashboard/favourites/:id',
    outlet: <Favourites />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF, ACCOUNT_TYPE.BUYER],
    additionalProps: {},
  },
  {
    path: '/dashboard/data-tables',
    outlet: <Tables />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF],
    additionalProps: {
      redirectPath: '/dashboard'
    },
  },
  {
    path: '/dashboard/new-product',
    outlet: <ProductCreateForm />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF],
    additionalProps: {
      redirectPath: '/dashboard'
    },
  },
  {
    path: '/dashboard/categories',
    outlet: <Categories />,
    allowedAccountTypes: [ACCOUNT_TYPE.STAFF],
    additionalProps: {
      redirectPath: '/dashboard'
    },
  },
];

export default dashboardRoutes;