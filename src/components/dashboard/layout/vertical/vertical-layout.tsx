'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTranslation } from 'react-i18next';

import { LangNs } from '@/lib/lang-ns';
import { useSettings } from '@/hooks/use-settings';

import { layoutConfig } from '../config';
import { MainNav } from './main-nav';
import { SideNav } from './side-nav';

export interface VerticalLayoutProps {
  children?: React.ReactNode;
}

export function VerticalLayout({ children }: VerticalLayoutProps): React.JSX.Element {
  const { settings } = useSettings();
  const [hide, setHide] = React.useState(false);

  const { t } = useTranslation([LangNs.LayoutConfig]);

  return (
    <React.Fragment>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': hide ? '0px' : '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />

      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {!hide && <SideNav color={settings.navColor} items={layoutConfig.navItems(t)} />}
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          <MainNav
            items={layoutConfig.navItems(t)}
            onButtonClick={() => {
              setHide(!hide);
            }}
          />
          <Box
            component="main"
            sx={{
              '--Content-margin': hide ? '0px' : '0 auto',
              '--Content-maxWidth': 'var(--maxWidth-xl)',
              '--Content-paddingX': '24px',
              '--Content-paddingY': { xs: '24px', lg: '64px' },
              '--Content-padding': 'var(--Content-paddingY) var(--Content-paddingX)',
              '--Content-width': '100%',
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}
