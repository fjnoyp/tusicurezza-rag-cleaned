// Steps

// 1) create the chain

// 2) require chat history to be passed each time (in future we can cache this using supabase or something)

import type { NextApiRequest, NextApiResponse } from 'next';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';

import { logger } from '@/lib/default-logger';
import { getSuggestionsRequestSchema, getSuggestionsResponseSchema } from '@/lib/pdf-chat/chat-message-data';

const model = new ChatOpenAI({ openAIApiKey: '', modelName: 'gpt-3.5-turbo' }); // openAIApiKey missing

const promptTemplate = PromptTemplate.fromTemplate(
  'Generate 2-3 short followup questions separated by | for the following response from the ai: {aiResponse}'
);

const outputParser = new StringOutputParser();

const chain = RunnableSequence.from([promptTemplate, model, outputParser]);

// Generate followup questions from an ai response message
const generateResponse = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  logger.debug('Received request with body:', req.body);
  if (req.method === 'POST') {
    try {
      const parsedBody = getSuggestionsRequestSchema.parse(req.body);
      const aiResponse: string = parsedBody.aiResponse;
      logger.debug('Processing AI response:', aiResponse);
      const result = await chain.invoke({ aiResponse });

      // return list string of suggestions
      logger.debug('Chain invocation result:', result);

      // parse the list by | into a list of suggestions
      const response = getSuggestionsResponseSchema.parse({ suggestions: result.split('|') });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error during chain invocation:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error });
    }
  } else {
    logger.warn('Received non-POST request');
    res.status(405).end(); // Method Not Allowed
  }
};

export default generateResponse;
