'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'next-i18next';

import { usePopover } from '@/hooks/use-popover';

import { languageFlags, LanguagePopover } from './language-popover';
import type { Language } from './language-popover';

interface LanguageSwitchProps {
  showOnXs?: boolean;
}

export function LanguageSwitch({ showOnXs = false }: LanguageSwitchProps): React.JSX.Element {
  const { i18n } = useTranslation();
  const popover = usePopover<HTMLButtonElement>();
  const language = (i18n.language || 'it') as Language;
  const flag = languageFlags[language];

  return (
    <React.Fragment>
      <Tooltip title="Language">
        <IconButton
          onClick={popover.handleOpen}
          ref={popover.anchorRef}
          sx={{ display: { xs: showOnXs ? 'inline-flex' : 'none', md: 'inline-flex' } }}
        >
          <Box sx={{ height: '24px', width: '24px' }}>
            <Box alt={language} component="img" src={flag} sx={{ height: 'auto', width: '100%' }} />
          </Box>
        </IconButton>
      </Tooltip>
      <LanguagePopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
    </React.Fragment>
  );
}
