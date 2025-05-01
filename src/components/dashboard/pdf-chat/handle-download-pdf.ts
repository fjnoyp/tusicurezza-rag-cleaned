import type { ChatMessageData} from '@/lib/pdf-chat/chat-message-data';

import { logger } from '@/lib/default-logger';


export async function handleDownloadPDF(messagesToSend: ChatMessageData[]): Promise<void> {    
    const response = await fetch("/api/download-pdf-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: messagesToSend }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat-history.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      logger.error("Failed to generate PDF");
    }
  };