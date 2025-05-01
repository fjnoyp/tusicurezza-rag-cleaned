/* eslint-disable @typescript-eslint/no-unsafe-assignment -- unknown it */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Cohere, CohereClient } from 'cohere-ai';
import type { ChatCitation, ChatDocument, EmbedByTypeResponseEmbeddings } from 'cohere-ai/api';
import { z } from 'zod';

import { logger } from '@/lib/default-logger';
import {
  askPdfChatResponseSchema,
  ChatMessageData,
  chatMessageRequestSchema,
  ChatMessageType,
} from '@/lib/pdf-chat/chat-message-data';

/*
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
 */

// README
// Run with: "tsx src/pages/api/new-get-suggestions.ts"

interface SearchParams {
  query_embedding: number[];
  match_threshold: number;
  match_count: number;
  target_article_id?: number | null;
  target_chapter_name?: string | null;
  //filter_metadata: Record<string, any> | undefined;
}

// type SearchResult = z.infer<typeof SearchResultSchema>;

const SearchResultSchema = z.object({
  id: z.number(),
  content: z.string(),
  article_id: z.number(),
  chapter_name: z.string(),
  similarity: z.number(),
  metadata_score: z.number(),
});

// API Keys
const cohereApiKey = '';
const supabaseUrl = 'https://.supabase.co';
const supabaseKey =
  '';

const cohereClient = new CohereClient({
  token: cohereApiKey,
  clientName: 'tusicurezza',
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function getQueryEmbedding(query: string): Promise<number[]> {
  const embeddingResponse = await cohereClient.embed({
    texts: [query],
    model: 'embed-multilingual-v3.0',
    inputType: Cohere.EmbedInputType.SearchDocument,
    embeddingTypes: [Cohere.EmbeddingType.Float],
    truncate: Cohere.EmbedRequestTruncate.None,
  });

  return (embeddingResponse.embeddings as EmbedByTypeResponseEmbeddings).float![0];
}

/*
// TODO: we will use this function to extract the articleId and chapterName from the query
async function getMetadataFilters(query: string): Promise<Record<string, any>> {
  const zodSchema = z.object({
    target_article_id: z.number().nullable().describe('The target article ID, if specified in the query'),
    target_chapter_name: z.string().nullable().describe('The target chapter name, if specified in the query'),
  });

  const prompt = new ChatPromptTemplate({
    promptMessages: [
      SystemMessagePromptTemplate.fromTemplate(
        "Extract the target article ID and/or chapter name from the user's query. If not specified, return null for the respective field."
      ),
      HumanMessagePromptTemplate.fromTemplate('{inputText}'),
    ],
    inputVariables: ['inputText'],
  });

  const llm = new ChatOpenAI({ model: 'gpt-3.5-turbo-0613', temperature: 0 });

  const functionCallingModel = llm.bind({
    functions: [
      {
        name: 'extract_query_info',
        description: "Extracts target article ID and chapter name from the user's query",
        parameters: zodSchema.shape,
      },
    ],
    function_call: { name: 'extract_query_info' },
  });

  const outputParser = new JsonOutputFunctionsParser();

  const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
}
  */

let citations: ChatCitation[] = [];
let chatDocuments: ChatDocument[] = [];

async function getSearchResults(query: string): Promise<z.infer<typeof SearchResultSchema>[]> {
  // Parse the query and extract metadata filters
  //const { metadataFilter, refinedQuery } = await parseQuery(query);
  // TODO: parse query into metadataFilter
  const queryEmbedding = await getQueryEmbedding(query);

  const searchParams: SearchParams = {
    query_embedding: queryEmbedding,
    match_threshold: 0.4,
    match_count: 10,
    target_article_id: null,
    target_chapter_name: null,
    //target_article_id: 1,
    //target_chapter_name: 'Titolo I PRINCIPI COMUNI Capo I Disposizioni generali',
  };

  const { data, error } = await supabase.rpc('match_documents', searchParams);

  if (error) {
    throw new Error(`Error performing similarity search: ${error.message}`);
  }

  //console.log('data', data);

  // Validate and parse the array of search results
  const searchResults = z.array(SearchResultSchema).parse(data);

  return searchResults;
}

const mapCitationsToDocuments = (): string => {
  // Create a map for quick lookup of documents by their id
  const documentMap: Record<string, { article_id: string | number; chapter_name: string; text: string }> =
    chatDocuments.reduce<Record<string, { article_id: string | number; chapter_name: string; text: string }>>(
      (map, doc) => {
        map[doc.id] = { article_id: doc.article_id, chapter_name: doc.chapter_name, text: doc.text };
        return map;
      },
      {}
    );

  let paragraph = '';
  const citationGroups: Record<string, string> = {}; // To track if we've already added a citation

  // Iterate over the citations
  citations.forEach((citation) => {
    let citationTextWithRefs = citation.text;

    citation.documentIds.forEach((docId) => {
      const doc = documentMap[docId];
      if (doc && !citationGroups[docId]) {
        // Append citation reference after the corresponding citation text
        const citationRef = `[CITATIONS:${doc.article_id}&:chapter_name=${doc.chapter_name}&:text=${doc.text}:CITATIONS]`;
        citationTextWithRefs += ` ${citationRef}`;
        citationGroups[docId] = citationRef; // Mark this citation as already added
      }
    });

    // Add the processed text (with citations) to the final paragraph
    paragraph += `${citationTextWithRefs} `;
  });

  return paragraph.trim(); // Return the final paragraph with citations in place
};

const chatStream = async (
  res: NextApiResponse,
  query: string,
  searchResults: z.infer<typeof SearchResultSchema>[]
): Promise<void> => {
  const chatStreamResponse = await cohereClient.chatStream({
    message: query,
    promptTruncation: Cohere.ChatRequestPromptTruncation.Off,
    temperature: 0.3,
    documents: searchResults.map((result) => ({
      id: result.id.toString(),
      text: result.content,
      article_id: result.article_id.toString(),
      chapter_name: result.chapter_name,
    })),
  });

  // console.log('..chatStreamResponse', chatStreamResponse);

  // Handle the streaming response
  for await (const chunk of chatStreamResponse) {
    if (chunk.eventType === 'search-results' && chunk.documents) {
      chatDocuments = chunk.documents;
    } else if (chunk.eventType === 'citation-generation' && chunk.citations?.length) {
      citations.push(...chunk.citations);
    }

    let mergedContent = '';

    if (chatDocuments?.length && citations?.length) {
      mergedContent = mapCitationsToDocuments();
    }

    if (chunk.eventType === 'search-results' || chunk.eventType === 'citation-generation') {
      if (chatDocuments?.length && citations?.length) {
        const response = askPdfChatResponseSchema.parse({
          messages: [new ChatMessageData(ChatMessageType.AI, mergedContent)],
        });

        res.write(`${JSON.stringify(response)}\n`);
      }
    }
  }
};

// Request handler similar to ask-pdf-chat
const generateResponse: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    logger.debug('Received request');
    try {
      const parsedChatMessageRequest = chatMessageRequestSchema.parse(req.body);

      const query = parsedChatMessageRequest.messages[parsedChatMessageRequest.messages.length - 1].content;

      citations = [];
      chatDocuments = [];

      const searchResults = await getSearchResults(query);

      // Search for documents based on query
      await chatStream(res, query, searchResults);

      if (!chatDocuments?.length || !citations?.length) {
        res.status(404).json({ error: 'No relevant documents found' });
        return;
      }
    } catch (error) {
      logger.error('Error processing request:', error);
      res.status(400).json({ error: 'Invalid request body', details: error });
    }
  } else {
    return res.status(405).end(); // Method Not Allowed
  }

  res.end();
};

export default generateResponse;

// // Example usage
// async function main() {
//   /*
//   const query =
//     'Quali categorie di persone sono considerate equiparabili ai lavoratori secondo la normativa sulla sicurezza sul lavoro, in particolare per quanto riguarda gli studenti e i volontari?';
//     */
//   const query = "quali sono gli obblighi del datore di lavoro per l'attivazione di un nuovo cantiere?";

//   try {
//     const results = await searchDocuments(query); // TODO - Handle result
//     console.log('Search results:', results);
//     // Process and use the results as needed
//   } catch (error) {
//     console.error('Error searching documents:', error);
//   }
// }

// void main();
