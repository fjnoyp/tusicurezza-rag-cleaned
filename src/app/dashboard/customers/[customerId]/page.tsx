import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';

import { config } from '@/config';
import CustomerDetails from '@/components/dashboard/customer/customer-details';

export const metadata = { title: `Details | Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

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
      <CustomerDetails />
    </Box>
  );
}
