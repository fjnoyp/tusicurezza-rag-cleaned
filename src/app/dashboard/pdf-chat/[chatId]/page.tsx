// Display the chat with the pdf and back button to go back to the chat list

import * as React from 'react';

import { PdfChatView } from '@/components/dashboard/pdf-chat/pdf-chat-view';

/*
interface PageProps {
  params: { threadId: string; threadType: ThreadType };
}

export default function Page({ params }: PageProps): React.JSX.Element {
  const { threadId, threadType } = params;

  return <ThreadView threadId={threadId} threadType={threadType} />;
}

*/

interface PageProps {
  params: { chatId: string };
}

export default function Page({ params: { chatId } }: PageProps): React.JSX.Element {
  return <PdfChatView threadId={chatId} />;
}
