import type * as React from 'react';

import { config } from '@/config';
import { AuthStrategy } from '@/lib/auth/strategy';

import { UserContext as SupabaseUserContext, UserProvider as SupabaseUserProvider } from './supabase/user-context';
import type { UserContextValue } from './types';

// eslint-disable-next-line import/no-mutable-exports -- Export based on config
let UserProvider: React.FC<{ children: React.ReactNode }>;

// eslint-disable-next-line import/no-mutable-exports -- Export based on config
let UserContext: React.Context<UserContextValue | undefined>;

switch (config.auth.strategy) {
  case AuthStrategy.SUPABASE:
    UserContext = SupabaseUserContext;
    UserProvider = SupabaseUserProvider;
    break;
  default:
    throw new Error('Invalid auth strategy');
}

export { UserProvider, UserContext };
