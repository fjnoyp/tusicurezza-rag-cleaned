/* eslint-disable no-console -- Temporary */
/*
TODO:
- Parse the file into chunks with proper metadata
- Embed a small subsection
- Try to run Cohere with that if possible
- Move to Supabase vector store 
- Test again 
*/

// TODO: we do not get past lines 7219 in 2008Formatted.xml

// README
// Run with: "tsx create-document-index.ts"
import * as fs from 'node:fs';

import { createClient } from '@supabase/supabase-js';
import { Cohere, CohereClient } from 'cohere-ai';
import type { EmbedByTypeResponseEmbeddings } from 'cohere-ai/api';
import * as xml2js from 'xml2js';

// File Controls
const FILE_PATH = '/Users/kyle/Downloads/2008Formatted.xml';
const FILE_NAME = '2008Formatted.xml';

// API Keys
const cohereApiKey = '';
const supabaseUrl = 'https://.supabase.co';
const supabaseKey = '';

const cohereClient = new CohereClient({
  token: cohereApiKey,
  clientName: 'tusicurezza',
});

const supabase = createClient(supabaseUrl, supabaseKey);

interface Metadata {
  //articleId: string;
  articleNumber: number;
  //chapterId: string;
  chapterName: string;
  //paragraphId: string;
  //paragraphNumber: string;
}

interface ContentGroup {
  id: string;
  text: string;
  metadata: Metadata;
}
interface ParsedXML {
  NIR: {
    DecretoLegislativo: {
      articolato: {
        capo: {
          $: { id: string };
          num: string[];
          articolo: {
            $: { id: string };
            num: string[];
            comma: {
              $: { id: string };
              num: string[];
              corpo: {
                'h:p': { _: string }[];
              }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  };
}

// Function to parse XML
async function parseXML(filePath: string): Promise<ParsedXML> {
  const xmlData = fs.readFileSync(filePath, 'utf-8');
  const parser: xml2js.Parser = new xml2js.Parser();
  return parser.parseStringPromise(xmlData) as Promise<ParsedXML>;
}

// Function to extract and group content with metadata
function extractContent(parsedXML: ParsedXML): ContentGroup[] {
  return parsedXML.NIR.DecretoLegislativo[0].articolato[0].capo.flatMap((capo) => {
    //const chapterId = capo.$.id;
    const chapterName = capo.num[0];

    return capo.articolo.flatMap((article) => {
      const articleId = article.$.id;
      //const articleNumber = article.num[0];

      return article.comma.map((comma) => {
        const paragraphId = comma.$.id;
        //const paragraphNumber = comma.num[0];
        const paragraphText = comma.corpo[0]['h:p'].map((p) => p._).join(' ');

        return {
          id: `${articleId}-${paragraphId}`,
          text: paragraphText,
          metadata: {
            articleNumber: Number(articleId),
            //articleNumber,
            //chapterId,
            chapterName,
            //paragraphId,
            //paragraphNumber,
          },
        };
      });
    });
  });
}

// Cohere max tokens is 512, but we use a different tokenizer so use 490 to be safe
function splitTextIntoTokens(text: string, maxTokens = 440): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);
  let currentChunk: string[] = [];
  let currentTokenCount = 0;

  for (const word of words) {
    // Rough estimate: 1 token ≈ 4 characters
    const wordTokens = Math.ceil(word.length / 4);

    if (currentTokenCount + wordTokens > maxTokens) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
      currentTokenCount = 0;
    }

    currentChunk.push(word);
    currentTokenCount += wordTokens;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}

// ================================
// EMBEDDING AND UPLOAD
// ================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars -- Temporary
async function embedAndUpload(contentGroups: ContentGroup[]): Promise<void> {
  // === COHERE EMBEDDINGS

  const embeddingPromises = contentGroups.map(async (group) => {
    return cohereClient.embed({
      texts: [group.text],
      model: 'embed-multilingual-v3.0',
      inputType: Cohere.EmbedInputType.SearchDocument,
      embeddingTypes: [Cohere.EmbeddingType.Float],
      truncate: Cohere.EmbedRequestTruncate.None,
    });
  });

  const embeddingResponses = await Promise.all(embeddingPromises);

  // === SUPABASE INSERTION

  const embeddings = embeddingResponses.map((response, index) => {
    const responseEmbeddings = response.embeddings as EmbedByTypeResponseEmbeddings;

    if (!responseEmbeddings.float || !Array.isArray(responseEmbeddings.float)) {
      console.error(`Unexpected embedding format for batch ${index}`);
      return [];
    }
    // Embeddings returned as array even though it's just a single text, ie: [ [embedding] ]
    return responseEmbeddings.float[0];
  });

  console.log(embeddings);

  const insertData = contentGroups.map((group, index) => ({
    //id: group.id,
    group_id: group.id,
    document_name: FILE_NAME,
    chunk_index: index,
    content: group.text,
    embedding: embeddings[index],
    metadata: group.metadata,
  }));

  const { error } = await supabase.from('document_vectors').insert(insertData);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully');
  }

  //console.log('All content groups processed and uploaded successfully');
}

// Main function
async function main(): Promise<void> {
  try {
    const parsedXML = await parseXML(FILE_PATH);
    const contentGroups = extractContent(parsedXML);

    const processedGroups = contentGroups.flatMap((group) => {
      const chunks = splitTextIntoTokens(group.text);
      return chunks.map((chunk, index) => ({
        ...group,
        id: `${group.id}-chunk${index + 1}`,
        text: chunk,
      }));
    });

    // print out all processed groups
    console.log(processedGroups);

    console.log(`Total vectors: ${processedGroups.length}`);
    console.log(`Total tokens: ${processedGroups.reduce((acc, group) => acc + group.text.split(/\s+/).length, 0)}`);

    // print out all the unique chapter names
    const uniqueChapterNames = Array.from(new Set(processedGroups.map((group) => group.metadata.chapterName)));
    console.log('Unique chapter names:', uniqueChapterNames);

    //const testGroup = processedGroups.slice(50, undefined);
    //await embedAndUpload(processedGroups);

    // Output the content groups with metadata
    //console.log(JSON.stringify(processedGroups, null, 2));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Only run main() if this file is being run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { parseXML, extractContent };

/*
CREATE TABLE document_vectors (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  document_id TEXT,
  chunk_index INTEGER,
  content TEXT,
  embedding VECTOR(1024),
  metadata JSONB
);

-- Create an index for faster similarity search
CREATE INDEX ON document_vectors USING ivfflat (embedding vector_cosine_ops);

-- Create an index on document_id for faster filtering
CREATE INDEX ON document_vectors (document_id);
*/
