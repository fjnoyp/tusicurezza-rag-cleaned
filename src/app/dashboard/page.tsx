import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';

import { config } from '@/config';

export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

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
      Benvenuto su Tusicurrezza, questa bacheca sarà una panoramica delle tue chat, fatture e clienti in futuro.
    </Box>
  );
}
