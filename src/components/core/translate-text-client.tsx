// Wrapper for translate-text-client to avoid SSR issues
'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';

interface TranslateTextClientProps {
  textKey: string;
  ns?: string;
}

function TranslateTextClient({ ns, textKey }: TranslateTextClientProps): React.ReactElement {
  const { t } = useTranslation(ns);
  return <span>{t(textKey)}</span>;
}

export default TranslateTextClient;
