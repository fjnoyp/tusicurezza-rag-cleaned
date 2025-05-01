import * as React from 'react';
import type { Metadata } from 'next';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { LangNs } from '@/lib/lang-ns';
import TranslateText from '@/components/core/translate-text';
import { InvoiceCreateForm } from '@/components/dashboard/invoice/invoice-create-form';

export const metadata = { title: `Create | Invoices | Dashboard | ${config.site.name}` } satisfies Metadata;

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
        <Stack spacing={3}>
          <div>
            <Link
              color="text.primary"
              component={RouterLink}
              href={paths.dashboard.invoices.list}
              sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
              variant="subtitle2"
            >
              <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
              <TranslateText ns={LangNs.Invoices} textKey="invoices" />
            </Link>
          </div>
          <div>
            <Typography variant="h4">
              <TranslateText ns={LangNs.Invoices} textKey="createInvoice" />
            </Typography>
          </div>
        </Stack>
        <InvoiceCreateForm />
      </Stack>
    </Box>
  );
}
