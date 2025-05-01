import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { logger } from '@/lib/default-logger';
import { LangNs } from '@/lib/lang-ns';
import {
  ChatMessageData,
  chatMessageRequestSchema,
  chatMessageSchema,
  ChatMessageSuggestionsData,
  ChatMessageType,
  getSuggestionsRequestSchema,
  getSuggestionsResponseSchema,
} from '@/lib/pdf-chat/chat-message-data';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/core/toaster';

export interface PdfChatThreadMessagesContextValue {
  messages: ChatMessageData[];
  askAi: (content: string) => void;
  loading: boolean;
}

export const PdfChatThreadMessagesContext = React.createContext<PdfChatThreadMessagesContextValue>({
  messages: [],
  askAi: () => undefined,
  loading: false,
});

export interface PdfChatThreadMessagesProviderProps {
  threadId: string;
  children: React.ReactNode;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  createdAt: string;
  content: string;
  parentChatThreadId: string;
}

interface InsertResponse {
  data: Message | null;
  error: Error | null;
}

const supabase = createClient();

export function PdfChatThreadMessagesProvider({
  threadId,
  children,
}: PdfChatThreadMessagesProviderProps): React.ReactElement {
  const [messages, setMessages] = React.useState<ChatMessageData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const { t } = useTranslation(LangNs.PdfChat);

  const askAi = React.useCallback(
    async (userQuestion: string) => {
      // Add user question to messages
      const humanMessage = new ChatMessageData(ChatMessageType.User, userQuestion);

      let currentMessages = [...messages, humanMessage];

      setMessages(currentMessages);

      // Ask AI api the user question
      // Only send AI and User types
      const filteredMessages = currentMessages.filter(
        (message) => message.messageType === ChatMessageType.AI || message.messageType === ChatMessageType.User
      );

      try {
        logger.debug('\n\nsending messages:', filteredMessages);
        setLoading(true);

        // Insert user message into the chat-message table
        const { data: insertedMessage, error } = (await supabase
          .from('chat-message')
          .insert([
            {
              type: 'user',
              content: userQuestion,
              parentChatThreadId: threadId,
            },
          ])
          .select()
          .single()) as InsertResponse;

        if (error) {
          throw error;
        }

        if (insertedMessage) {
          const newMessages = [...messages, new ChatMessageData(ChatMessageType.User, insertedMessage.content)];

          setMessages(newMessages);

          // Ask AI api the user question
          const aiResponseMessages = await _fetchPdfChatResponse(newMessages, setMessages);

          // Insert AI messages into the chat-message table
          const aiMessagesToInsert = aiResponseMessages.map((message) => ({
            type: 'ai',
            content: message.content,
            parentChatThreadId: threadId,
          }));

          const { data: insertedAiMessages, error: aiError } = await supabase
            .from('chat-message')
            .insert(aiMessagesToInsert)
            .select();

          if (aiError) {
            logger.error(error);
            toast.error('Something went wrong!');
          }

          if (insertedAiMessages) {
            const newAiMessages = insertedAiMessages.map(
              (msg: Message) => new ChatMessageData(ChatMessageType.AI, msg.content)
            );
            currentMessages = [...newMessages, ...newAiMessages];
            setMessages(currentMessages);
          }

          const suggestionMessages = await _fetchSuggestionMessages(newMessages[newMessages.length - 1]);

          currentMessages = [...currentMessages, ...suggestionMessages];

          setMessages(currentMessages);

          setLoading(false);
        }
      } catch (error) {
        logger.error('Failed to ask AI:', error);
      } finally {
        setLoading(false);
      }
    },
    [messages, threadId]
  );

  React.useEffect(() => {
    const fetchMessages = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch messages for the given threadId from chat-message table
        const { data, error } = await supabase.from('chat-message').select('*').eq('parentChatThreadId', threadId);

        if (error) {
          logger.error(error);
        }

        if (data) {
          const fetchedMessages = data.map(
            (msg: Message) =>
              new ChatMessageData(msg.type === 'user' ? ChatMessageType.User : ChatMessageType.AI, msg.content)
          );

          setMessages([new ChatMessageData(ChatMessageType.AI, t('welcome')), ...fetchedMessages]);
        }

        setLoading(false);
      } catch (error) {
        logger.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchMessages();
  }, [t, threadId]);

  return (
    <PdfChatThreadMessagesContext.Provider
      value={{
        messages,
        askAi,
        loading,
      }}
    >
      {children}
    </PdfChatThreadMessagesContext.Provider>
  );
}

export function usePdfChatThreadContext(): PdfChatThreadMessagesContextValue {
  const context = React.useContext(PdfChatThreadMessagesContext);
  if (context.askAi === undefined) {
    throw new Error('usePdfChatThread must be used within a PdfChatThreadProvider');
  }
  return context;
}

async function _fetchPdfChatResponse(
  messages: ChatMessageData[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageData[]>>
): Promise<ChatMessageData[]> {
  try {
    const originalMessages = [...messages];

    const request = {
      messages,
    };

    // Validate the messages against the schema
    chatMessageRequestSchema.parse(request);

    const response = await fetch('/api/new-get-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok || !response.body) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let streamText = '';
    let allMessages: ChatMessageData[] = []; // Initialize an empty array

    let streamDone = false;
    // Read chunks as they arrive
    while (!streamDone) {
      // eslint-disable-next-line no-await-in-loop -- Necessary to await each read operation
      const { done, value } = await reader.read();
      if (done) {
        streamDone = true;
        break; // No more data
      }

      // Decode the chunk
      streamText += decoder.decode(value, { stream: true });

      // logger.debug('streamText', streamText);

      // Attempt to parse partial or complete JSON response
      try {
        // Try to parse the accumulated text into JSON
        const parsedJson = JSON.parse(streamText) as {
          messages: z.infer<typeof chatMessageSchema>[];
        };

        const responseSchema = z.object({
          messages: z.array(chatMessageSchema),
        });
        const parsedResponse = responseSchema.parse(parsedJson);

        // Completely rewrite the allMessages array when new valid JSON is parsed
        allMessages = parsedResponse.messages.map(
          (message: z.infer<typeof chatMessageSchema>) => new ChatMessageData(message.messageType, message.content)
        );

        setMessages([...originalMessages, ...allMessages]);

        // Clear streamText if successfully parsed
        streamText = '';
      } catch (e) {
        // Not a complete JSON yet, keep reading chunks
        continue;
      }
    }

    return allMessages; // Return the final updated array
  } catch (error) {
    logger.error('Failed to fetch PDF chat response:', error);
    throw error;
  }
}

async function _fetchSuggestionMessages(aiMessage: ChatMessageData): Promise<ChatMessageSuggestionsData[]> {
  const request = {
    aiResponse: aiMessage.content,
  };

  getSuggestionsRequestSchema.parse(request);

  const response = await fetch('/api/get-suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const parsedResponse = getSuggestionsResponseSchema.parse(await response.json());
  return parsedResponse.suggestions.map((suggestion: string) => new ChatMessageSuggestionsData(suggestion));
}
