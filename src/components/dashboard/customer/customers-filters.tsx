'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { paths } from '@/paths';
import { LangNs } from '@/lib/lang-ns';
import { FilterButton, FilterPopover, useFilterContext } from '@/components/core/filter-button';
import { Option } from '@/components/core/option';

import { useCustomersSelection } from './customers-selection-context';

// The tabs should be generated using API data.
const tabs = (t: (key: string) => string) =>
  [
    { label: t('customerFilters.all'), value: '', count: 5 },
    { label: t('customerFilters.active'), value: 'active', count: 3 },
    { label: t('customerFilters.pending'), value: 'pending', count: 1 },
    { label: t('customerFilters.blocked'), value: 'blocked', count: 1 },
  ] as const;

export interface Filters {
  email?: string;
  phone?: string;
  status?: string;
}

export type SortDir = 'asc' | 'desc';

export interface CustomersFiltersProps {
  filters?: Filters;
  sortDir?: SortDir;
}

export function CustomersFilters({ filters = {}, sortDir = 'desc' }: CustomersFiltersProps): React.JSX.Element {
  const { email, phone, status } = filters;

  const router = useRouter();
  const { t } = useTranslation([LangNs.Customers]);

  const selection = useCustomersSelection();

  const updateSearchParams = React.useCallback(
    (newFilters: Filters, newSortDir: SortDir): void => {
      const searchParams = new URLSearchParams();

      if (newSortDir === 'asc') {
        searchParams.set('sortDir', newSortDir);
      }

      if (newFilters.status) {
        searchParams.set('status', newFilters.status);
      }

      if (newFilters.email) {
        searchParams.set('email', newFilters.email);
      }

      if (newFilters.phone) {
        searchParams.set('phone', newFilters.phone);
      }

      router.push(`${paths.dashboard.customers.list}?${searchParams.toString()}`);
    },
    [router]
  );

  const handleClearFilters = React.useCallback(() => {
    updateSearchParams({}, sortDir);
  }, [updateSearchParams, sortDir]);

  const handleStatusChange = React.useCallback(
    (_: React.SyntheticEvent, value: string) => {
      updateSearchParams({ ...filters, status: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleEmailChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, email: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handlePhoneChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, phone: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSortChange = React.useCallback(
    (event: SelectChangeEvent) => {
      updateSearchParams(filters, event.target.value as SortDir);
    },
    [updateSearchParams, filters]
  );

  const hasFilters = status || email || phone;

  return (
    <div>
      <Tabs onChange={handleStatusChange} sx={{ px: 3 }} value={status ?? ''} variant="scrollable">
        {tabs(t).map((tab) => (
          <Tab
            icon={<Chip label={tab.count} size="small" variant="soft" />}
            iconPosition="end"
            key={tab.value}
            label={t(tab.label)}
            sx={{ minHeight: 'auto' }}
            tabIndex={0}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', px: 3, py: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
          <FilterButton
            displayValue={email}
            label={t('customerFilters.email')}
            onFilterApply={(value) => {
              handleEmailChange(value as string);
            }}
            onFilterDelete={() => {
              handleEmailChange();
            }}
            popover={<EmailFilterPopover />}
            value={email}
          />
          <FilterButton
            displayValue={phone}
            label={t('customerFilters.phone')}
            onFilterApply={(value) => {
              handlePhoneChange(value as string);
            }}
            onFilterDelete={() => {
              handlePhoneChange();
            }}
            popover={<PhoneFilterPopover />}
            value={phone}
          />
          {hasFilters ? <Button onClick={handleClearFilters}>{t('customerFilters.clearFilters')}</Button> : null}
        </Stack>
        {selection.selectedAny ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {selection.selected.size} {t('customerFilters.selected')}
            </Typography>
            <Button color="error" variant="contained">
              {t('customerFilters.delete')}
            </Button>
          </Stack>
        ) : null}
        <Select name="sort" onChange={handleSortChange} sx={{ maxWidth: '100%', width: '120px' }} value={sortDir}>
          <Option value="desc">{t('customerFilters.newest')}</Option>
          <Option value="asc">{t('customerFilters.oldest')}</Option>
        </Select>
      </Stack>
    </div>
  );
}

function EmailFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const { t } = useTranslation([LangNs.LayoutConfig]);
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by email">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        {t('customerFilters.apply')}
      </Button>
    </FilterPopover>
  );
}

function PhoneFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const { t } = useTranslation([LangNs.Customers]);
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by phone number">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        {t('customerFilters.apply')}
      </Button>
    </FilterPopover>
  );
}
