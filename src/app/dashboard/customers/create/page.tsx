import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { config } from '@/config';
import { CustomerCreateForm } from '@/components/dashboard/customer/customer-create-form';
import CustomerHeader from '@/components/dashboard/customer/customer-header';

export const metadata = { title: `Create | Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        <CustomerHeader />
        <CustomerCreateForm />
      </Stack>
    </Box>
  );
}
