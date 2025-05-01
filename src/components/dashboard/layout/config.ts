import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

// NOTE: We did not use React Components for Icons, because
//  you may one to get the config from the server.

// NOTE: First level elements are groups.

export interface LayoutConfig {
  navItems: NavItemConfig[];
}

export const layoutConfig = {
  navItems: (t: (key: string) => string): NavItemConfig[] => {
    return [
      {
        key: 'dashboards',
        title: t('Dashboards'),
        items: [{ key: 'overview', title: t('Overview'), href: paths.dashboard.overview, icon: 'house' }],
      },
      {
        key: 'general',
        title: t('General'),
        items: [
          {
            key: 'settings',
            title: t('Settings'),
            href: paths.dashboard.settings.account,
            icon: 'gear',
            matcher: { type: 'startsWith', href: '/dashboard/settings' },
          },
          {
            key: 'customers',
            title: t('Customers'),
            icon: 'users',
            items: [
              { key: 'customers', title: t('listCustomers'), href: paths.dashboard.customers.list },
              { key: 'customers:create', title: t('Create customer'), href: paths.dashboard.customers.create },
              { key: 'customers:details', title: t('Customer details'), href: paths.dashboard.customers.details('1') },
            ],
          },
          {
            key: 'invoices',
            title: t('Invoices'),
            icon: 'receipt',
            items: [
              { key: 'invoices', title: t('List invoices'), href: paths.dashboard.invoices.list },
              { key: 'invoices:create', title: t('Create invoice'), href: paths.dashboard.invoices.create },
              { key: 'invoices:details', title: t('Invoice details'), href: paths.dashboard.invoices.details('1') },
            ],
          },
          {
            key: 'pdf-chat',
            title: t('PDF Chat'),
            href: paths.dashboard.pdfChat.base,
            icon: 'chats-circle',
            matcher: { type: 'startsWith', href: '/dashboard/pdf-chat' },
          },
        ],
      },
      {
        key: 'other',
        title: t('Other'),
        items: [
          {
            key: 'auth',
            title: t('Auth'),
            icon: 'lock',
            items: [
              {
                key: 'auth:reset-password',
                title: t('Reset password'),
                items: [
                  {
                    key: 'auth:reset-password',
                    title: t('Reset password'),
                    href: paths.auth.supabase.resetPassword,
                  },
                ],
              },
              {
                key: 'auth:update-password',
                title: t('Update password'),
                items: [
                  {
                    key: 'auth:update-password',
                    title: t('Update password'),
                    href: paths.auth.supabase.updatePassword,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  },
};
