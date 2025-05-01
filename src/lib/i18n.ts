import { use } from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { logger } from '@/lib/default-logger';

import { LangNs } from './lang-ns';

export const i18n = use(Backend)
  .use(initReactI18next)
  .init({
    lng: 'it',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ns: [
      LangNs.Common,
      LangNs.Auth,
      LangNs.Welcome,
      LangNs.Customers,
      LangNs.Invoices,
      LangNs.PdfChat,
      LangNs.LayoutConfig,
    ],
    defaultNS: LangNs.Common,
  })
  .catch((err) => {
    logger.error('Failed to initialize i18n', err);
  });
