import type { ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PostgrestError } from '@supabase/postgrest-js';

import { logger } from '@/lib/default-logger';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';

interface Thread {
  id: string;
  authorUserId: string;
  name: string;
  summary: string;
  createdAt: string;
}

interface ThreadContextType {
  threads: Thread[];
  fetchThreads: () => Promise<void>;
  createThread: (userId: string, name: string, summary: string) => Promise<Thread | null>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

const supabase = createClient();

function ThreadProvider({ children }: { children: ReactNode }): React.ReactElement {
  const { user } = useUser();
  const [threads, setThreads] = useState<Thread[]>([]);

  const fetchThreads = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    try {
      const { data, error }: { data: Thread[] | null; error: PostgrestError | null } = await supabase
        .from('chat-thread')
        .select('*')
        .eq('authorUserId', user.id);

      if (error) {
        logger.error(error);
      } else {
        setThreads(data || []);
      }
    } catch (error) {
      logger.error(error);
    }
  }, [user?.id, setThreads]);

  async function createThread(userId: string, name: string, summary: string): Promise<Thread | null> {
    try {
      const { data, error }: { data: Thread | null; error: PostgrestError | null } = await supabase
        .from('chat-thread')
        .insert({
          name,
          authorUserId: userId,
          summary,
        })
        .select()
        .single();

      if (error) {
        logger.error(error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  return <ThreadContext.Provider value={{ threads, fetchThreads, createThread }}>{children}</ThreadContext.Provider>;
}

function useThreads(): ThreadContextType {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error('useThreads must be used within a ThreadProvider');
  }
  return context;
}

export { ThreadProvider, useThreads };
