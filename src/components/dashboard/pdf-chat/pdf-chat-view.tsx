'use client';

import * as React from 'react';
import { Button, Card, CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { PiCopyBold, PiFilePdfBold, PiPrinterBold, PiTestTubeBold } from 'react-icons/pi';

import type { ChatMessageData } from '@/lib/pdf-chat/chat-message-data';
import { ChatMessageSuggestionsData, ChatMessageType } from '@/lib/pdf-chat/chat-message-data';

//import { logger } from '@/lib/default-logger';
import { handleDownloadPDF } from './handle-download-pdf';
import { PdfChatThreadMessagesProvider, usePdfChatThreadContext } from './pdf-chat-thread-messages-context';
import { PdfView } from './pdf-view/pdf-view';
import { PdfViewProvider, usePdfView } from './pdf-view/pdf-view-context';

interface PageProps {
  threadId: string;
}

export function PdfChatView({ threadId }: PageProps): React.JSX.Element {
  return (
    <PdfChatThreadMessagesProvider threadId={threadId}>
      <PdfViewProvider>
        <Box sx={{ display: 'flex', flex: '1 1 0', minHeight: 0 }}>
          <SidebarChat />

          <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh', // Ensure the Box takes the full viewport height
                overflowY: 'auto', // Enable vertical scrolling
                minWidth: '240px',
              }}
            >
              <PdfView />
            </Box>
          </Box>
        </Box>
      </PdfViewProvider>
    </PdfChatThreadMessagesProvider>
  );
}

function SidebarChat(): React.JSX.Element {
  const pdfChatThread = usePdfChatThreadContext();
  const [message, setMessage] = React.useState('');

  function sendMessage(): void {
    pdfChatThread.askAi(message);
    setMessage(''); // Clear the input field after sending the message
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        border: '2px solid var(--mui-palette-divider)', // Outline around the component
        borderRadius: '2px',
        minWidth: '400px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
        <IconButton
          aria-label="print"
          color="primary"
          onClick={() => {
            window.print();
          }}
        >
          <PiPrinterBold />
        </IconButton>
        <IconButton
          aria-label="save as pdf"
          color="primary"
          onClick={async () => {
            await handleDownloadPDF(pdfChatThread.messages);
          }}
        >
          <PiFilePdfBold />
        </IconButton>
        <IconButton aria-label="test" color="primary">
          <PiTestTubeBold />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
        {/* Messages will be displayed here */}
        <MessageList
          onSuggestionsClick={(content: string) => {
            pdfChatThread.askAi(content);
          }}
        />
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', mt: 2, p: 1 }}>
        <TextField
          fullWidth
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
              e.preventDefault(); // Prevents new line in textarea after sending message
            }
          }}
          placeholder="Type a message..."
          value={message}
          variant="outlined"
        />
        <Button color="primary" onClick={sendMessage} sx={{ ml: 2 }} variant="contained">
          Send
        </Button>
      </Box>
    </Box>
  );
}

function MessageList({ onSuggestionsClick }: { onSuggestionsClick?: (content: string) => void }): React.JSX.Element {
  const pdfChatThread = usePdfChatThreadContext();
  const messages = pdfChatThread.messages;
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Stack spacing={1} sx={{ flex: '1 1 auto', overflowY: 'auto', p: 2 }}>
      {messages.map((message) => {
        if (message instanceof ChatMessageSuggestionsData) {
          return (
            <ChatSuggestionMessageView
              key={JSON.stringify(message)}
              message={message}
              onSuggestionClick={(content: string) => {
                onSuggestionsClick && onSuggestionsClick(content);
              }}
            />
          );
        }
        return <MessageView key={JSON.stringify(message)} message={message} />;
      })}
      <div ref={messagesEndRef} />
      {pdfChatThread.loading ? <CircularProgress /> : null}
    </Stack>
  );
}

function MessageView({ message }: { message: ChatMessageData }): React.JSX.Element {
  const pdfView = usePdfView();

  const isUser = message.messageType === ChatMessageType.User;
  const position = isUser ? 'right' : 'left';
  const showCopyButton = !isUser;

  return (
    <Box
      sx={{
        alignItems: position === 'right' ? 'flex-end' : 'flex-start',
        flex: '0 0 auto',
        display: 'flex',
      }}
    >
      <Stack
        direction={position === 'right' ? 'row-reverse' : 'row'}
        sx={{
          alignItems: 'flex-start',
          maxWidth: '500px',
          ml: position === 'right' ? 'auto' : 0,
          mr: position === 'left' ? 'auto' : 0,
        }}
      >
        <Stack sx={{ flex: '1 1 auto' }}>
          <Card
            sx={{
              px: 2,
              py: 1,
              outline: '2px solid rgba(0, 0, 0, 0.12)',
              ...(position === 'right' && {
                bgcolor: 'var(--mui-palette-primary-main)',
                color: 'var(--mui-palette-primary-contrastText)',
              }),
            }}
          >
            <Stack spacing={1}>
              <Typography color="inherit" variant="body1">
                {renderAiResponse(message.content)}
              </Typography>
            </Stack>
          </Card>

          <Box
            sx={{
              display: 'flex',
              justifyContent: position === 'right' ? 'flex-end' : 'flex-start',
              alignItems: 'center',
            }}
          >
            {showCopyButton ? <CopyButton content={message.content} /> : <Box sx={{ p: 1 }} />}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );

  function renderAiResponse(content: string): React.JSX.Element[] {
    const elements: React.JSX.Element[] = [];

    // Regular expression to match page markers and citation markers with article_id, chapter_name, and text, ending with ":CITATIONS]"
    const pageRegex = /\[P(?<pageNum>\d+)\]/g;
    const citationRegex =
      /\[CITATIONS:(?<article_id>\d+)&:chapter_name=(?<chapterName>[^&]+)&:text=(?<citationText>[^\]]+):CITATIONS\]/g;

    let lastIndex = 0;
    let match;

    // Generate a unique key for each element based on content and position
    const generateKey = (text: string, pos: number): string => {
      return `${text}-${pos}}`;
    };

    // Helper function to get the first two words of a string
    const getFirstTwoWords = (text: string): string => {
      return text.split(' ').slice(0, 2).join(' ');
    };

    let i = 0;

    // Process the page markers [P<num>]
    while ((match = pageRegex.exec(content)) !== null) {
      i++;
      const pageNum = match.groups?.pageNum;

      // Add the text before the page marker
      if (lastIndex < match.index) {
        const textSlice = content.slice(lastIndex, match.index) + i;
        elements.push(
          <Typography component="span" key={generateKey(textSlice, lastIndex)} variant="body1">
            {textSlice}
          </Typography>
        );
      }

      // Add the clickable page number as inline
      elements.push(
        <Typography
          color="primary"
          component="span"
          key={`page-${pageNum}-${i}`}
          onClick={() => {
            pdfView.scrollToPage(Number(pageNum)); // Assume pdfView.scrollToPage is available to scroll to the page
          }}
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
        >
          [P{pageNum}]
        </Typography>
      );

      lastIndex = pageRegex.lastIndex;
    }

    // Process the citation markers [CITATIONS:article_id&:chapter_name=<chapter_name>&:text=<text>:CITATIONS]
    while ((match = citationRegex.exec(content)) !== null) {
      i++;
      const articleId = match.groups?.article_id;
      const chapterName = match.groups?.chapterName ?? '';
      const citationText = match.groups?.citationText; // Capture citation text
      const shortChapterName = getFirstTwoWords(chapterName); // Get the first two words of the chapter name

      // Add the text before the citation (this includes the sentence before the citation)
      if (lastIndex < match.index) {
        const textSlice = content.slice(lastIndex, match.index);
        elements.push(
          <Typography component="span" key={generateKey(textSlice, lastIndex)} variant="body1">
            {textSlice}
          </Typography>
        );
      }

      // Add the clickable citation with article_id prefixed with "art:" and the first two words of chapter_name
      elements.push(
        <Typography
          color="primary"
          component="span"
          key={`citation-${articleId}-${i}`}
          onClick={() => {
            // Call setSearch with the citationText when the citation is clicked
            pdfView.setSearch(citationText ?? '');
          }}
          sx={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '4px', px: 0.5 }} // Ensure it is inline
        >
          {`art:${articleId}:${shortChapterName}`}
        </Typography>
      );

      lastIndex = citationRegex.lastIndex; // Move past the citation marker
    }

    // Add any remaining text after the last citation or page marker
    if (lastIndex < content.length) {
      const textSlice = content.slice(lastIndex);
      elements.push(
        <Typography component="span" key={generateKey(textSlice, lastIndex)} variant="body1">
          {textSlice}
        </Typography>
      );
    }

    return elements;
  }
}

function ChatSuggestionMessageView({
  message,
  onSuggestionClick,
}: {
  message: ChatMessageSuggestionsData;
  onSuggestionClick: (content: string) => void;
}): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {message.suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          onClick={() => {
            onSuggestionClick(suggestion);
          }}
          sx={{
            padding: '0.25rem 0.5rem', // Smaller padding
            boxShadow: 1,
            fontSize: '0.75rem', // Smaller text
          }}
          variant="outlined"
        >
          {suggestion}
        </Button>
      ))}
    </Box>
  );
}

function CopyButton({ content }: { content: string }): React.JSX.Element {
  return (
    <IconButton color="primary" onClick={() => navigator.clipboard.writeText(content)}>
      <PiCopyBold />
    </IconButton>
  );
}
