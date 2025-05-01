'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { Minus as MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { PencilSimple as PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { useTranslation } from 'react-i18next';

import { paths } from '@/paths';
import { dayjs } from '@/lib/dayjs';
import { LangNs } from '@/lib/lang-ns';
import { DataTable } from '@/components/core/data-table';
import type { ColumnDef } from '@/components/core/data-table';

import { useCustomersSelection } from './customers-selection-context';

export interface Customer {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone?: string;
  quota: number;
  status: 'pending' | 'active' | 'blocked';
  createdAt: Date;
}

const columns = (t: (key: string) => string): ColumnDef<Customer>[] =>
  [
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Avatar src={row.avatar} />{' '}
          <div>
            <Link
              color="inherit"
              component={RouterLink}
              href={paths.dashboard.customers.details('1')}
              sx={{ whiteSpace: 'nowrap' }}
              variant="subtitle2"
            >
              {row.name}
            </Link>
            <Typography color="text.secondary" variant="body2">
              {row.email}
            </Typography>
          </div>
        </Stack>
      ),
      name: t('customerTable.name'),
      width: '250px',
    },
    {
      formatter: (row): React.JSX.Element => (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <LinearProgress sx={{ flex: '1 1 auto' }} value={row.quota} variant="determinate" />
          <Typography color="text.secondary" variant="body2">
            {new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format(row.quota / 100)}
          </Typography>
        </Stack>
      ),
      name: t('customerTable.quota'),
      width: '250px',
    },
    { field: 'phone', name: t('customerTable.phone'), width: '150px' },
    {
      formatter(row) {
        return dayjs(row.createdAt).format('MMM D, YYYY h:mm A');
      },
      name: t('customerTable.createdAt'),
      width: '200px',
    },
    {
      formatter: (row): React.JSX.Element => {
        const mapping = {
          active: { label: 'Active', icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" /> },
          blocked: { label: 'Blocked', icon: <MinusIcon color="var(--mui-palette-error-main)" /> },
          pending: { label: 'Pending', icon: <ClockIcon color="var(--mui-palette-warning-main)" weight="fill" /> },
        } as const;
        const { label, icon } = mapping[row.status] ?? { label: 'Unknown', icon: null };

        return <Chip icon={icon} label={label} size="small" variant="outlined" />;
      },
      name: 'Status',
      width: '150px',
    },
    {
      formatter: (): React.JSX.Element => (
        <IconButton component={RouterLink} href={paths.dashboard.customers.details('1')}>
          <PencilSimpleIcon />
        </IconButton>
      ),
      name: 'Actions',
      hideName: true,
      width: '100px',
      align: 'right',
    },
  ] satisfies ColumnDef<Customer>[];

export interface CustomersTableProps {
  rows: Customer[];
}

export function CustomersTable({ rows }: CustomersTableProps): React.JSX.Element {
  const { t } = useTranslation([LangNs.Customers]);

  const { deselectAll, deselectOne, selectAll, selectOne, selected } = useCustomersSelection();

  return (
    <React.Fragment>
      <DataTable<Customer>
        columns={columns(t)}
        onDeselectAll={deselectAll}
        onDeselectOne={(_, row) => {
          deselectOne(row.id);
        }}
        onSelectAll={selectAll}
        onSelectOne={(_, row) => {
          selectOne(row.id);
        }}
        rows={rows}
        selectable
        selected={selected}
      />
      {!rows.length ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            {t('customerTable.noCustomersFound')}
          </Typography>
        </Box>
      ) : null}
    </React.Fragment>
  );
}
