'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/utils/typography';
import { Box, Button, ButtonBase, Card, CardActions, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { useTranslation } from 'react-i18next';

import { paths } from '@/paths';
import { LangNs } from '@/lib/lang-ns';
import { useUser } from '@/hooks/use-user';
import { toast } from '@/components/core/toaster';
import TranslateText from '@/components/core/translate-text';
import { ThreadProvider, useThreads } from '@/components/dashboard/pdf-chat/pdf-chat-threads-context';

export default function Page(): React.ReactElement {
  return (
    <ThreadProvider>
      <ThreadPageContent />
    </ThreadProvider>
  );
}

function ThreadPageContent(): React.ReactElement {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useTranslation(LangNs.PdfChat);
  const { threads, createThread } = useThreads();

  const handleChatRedirect = async (): Promise<void> => {
    if (!user?.id) return;

    const newThread = await createThread(user.id, t('New Chat Thread'), t('New chat summary'));
    if (newThread) {
      router.push(`${paths.dashboard.pdfChat.base}/${newThread.id}`);
    } else {
      toast.error('Something went wrong!');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack alignItems="center" direction="row" justifyContent="space-between" mb={3}>
        <Typography component="h1" variant="h5">
          <TranslateText ns={LangNs.PdfChat} textKey="myThreads" />
        </Typography>
        <Button color="primary" onClick={handleChatRedirect} startIcon={<Plus />} variant="contained">
          <TranslateText ns={LangNs.PdfChat} textKey="startNewChat" />
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {threads.length > 0 ? (
          threads.map((thread) => (
            <Grid item key={thread.id} sm={6}>
              <Link href={`/dashboard/pdf-chat/${thread.id}`}>
                <ButtonBase sx={{ width: '100%', textAlign: 'start' }}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent sx={{ pb: 0 }}>
                      <Typography variant="h6">{thread.name}</Typography>
                    </CardContent>
                    <CardActions sx={{ padding: '16px 24px' }}>
                      <Typography variant="body2">{timeAgo(thread.createdAt)}</Typography>
                    </CardActions>
                  </Card>
                </ButtonBase>
              </Link>
            </Grid>
          ))
        ) : (
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: '1 1 auto',
              overflowY: 'auto',
              p: 3,
            }}
          >
            <Box
              component="img"
              src="/assets/not-found.svg"
              sx={{ height: 'auto', maxWidth: '100%', width: '120px' }}
            />
            <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="subtitle1">
              <TranslateText ns={LangNs.PdfChat} textKey="noThreadsYet" />
            </Typography>
          </Stack>
        )}
      </Grid>
    </Box>
  );
}
