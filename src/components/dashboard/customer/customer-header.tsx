'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { useTranslation } from 'react-i18next';

import { paths } from '@/paths';
import { LangNs } from '@/lib/lang-ns';

export default function CustomerHeader(): React.JSX.Element {
  const { t } = useTranslation([LangNs.Customers]);

  return (
    <Stack spacing={3}>
      <div>
        <Link
          color="text.primary"
          component={RouterLink}
          href={paths.dashboard.customers.list}
          sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
          variant="subtitle2"
        >
          <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
          {t('customerHeader.customers')}
        </Link>
      </div>
      <div>
        <Typography variant="h4">{t('customerHeader.createCustomer')}</Typography>
      </div>
    </Stack>
  );
}
