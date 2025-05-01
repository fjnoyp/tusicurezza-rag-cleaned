// Generates a PDF of chat history

import * as React from 'react';
import type { JSX } from 'react';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Document, Page, renderToStream, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { ChatMessageData } from '@/lib/pdf-chat/chat-message-data';
import { chatMessageRequestSchema, ChatMessageType } from '@/lib/pdf-chat/chat-message-data';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 30,
  },
  text: {
    margin: 10,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  userMessage: {
    backgroundColor: '#e1f5fe',
    padding: 10,
    borderRadius: 5,
  },
  aiMessage: {
    backgroundColor: '#fce4ec',
    padding: 10,
    borderRadius: 5,
  },
});

function MyDocument({ messages }: { messages: ChatMessageData[] }): JSX.Element {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.text}>{`Generated on: ${new Date().toLocaleString()}`}</Text>
        {messages.map((message) => (
          <View
            key={JSON.stringify(message)}
            style={message.messageType === ChatMessageType.User ? styles.userMessage : styles.aiMessage}
          >
            <Text style={styles.text}>{`${ChatMessageType[message.messageType]}: ${message.content}`}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'POST') {
    try {
      const parsedChatMessageRequest = chatMessageRequestSchema.parse(req.body);
      const messages: ChatMessageData[] = parsedChatMessageRequest.messages;

      const stream = await renderToStream(<MyDocument messages={messages} />);
      res.setHeader('Content-Type', 'application/pdf');
      stream.pipe(res);
    } catch (error) {
      res.status(400).json({ error: 'Invalid request body' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
