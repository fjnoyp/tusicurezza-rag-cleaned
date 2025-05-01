<p align="center">
  <!-- Add a relevant logo here if available -->
  <!-- <img src="path/to/logo.png" alt="TusiCurezza Logo" width="200"/> -->
</p>

<h1 align="center">TusiCurezza - AI-Powered Legal Document Assistant</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue" alt="Frontend"/>
  <img src="https://img.shields.io/badge/Backend-Next.js-lightgrey" alt="Backend"/>
  <img src="https://img.shields.io/badge/Database-Supabase-green" alt="Database"/>
  <img src="https://img.shields.io/badge/AI-Cohere%20%7C%20OpenAI-red" alt="AI"/>
  <img src="https://img.shields.io/badge/Search-RAG%20%2B%20FTS-orange" alt="Search"/>
</p>

## Project Overview

TusiCurezza is a React-based web application featuring an intelligent chatbot designed to assist users with Italian legal documents. It provides accurate answers with precise citations, leveraging a sophisticated Supabase hybrid search (RAG + Full-Text Search) combined with Cohere embeddings and chat streaming.

## Key Features
 
- **Intelligent Chatbot**: Engage in natural language conversations about Italian legal documents.
- **Accurate Citations**: Responses include citations linked directly to the relevant sections in the original document.
- **Advanced Search**: Utilizes Supabase hybrid search (Vector Similarity + FTS) for comprehensive information retrieval.
- **Real-time Interaction**: Features streaming responses from Cohere for a fluid user experience.
- **Contextual Follow-ups**: Automatically generates relevant follow-up questions using OpenAI.
- **Integrated PDF Viewer**: Displays documents alongside the chat, with clickable citations scrolling to the precise location.
- **Custom Document Processing**: Employs a RAG pipeline that respects document structure for accurate chunking and embedding.

## Technical Stack

- **Frontend**: React.js with Material-UI (based on Devias Kit Pro template)
- **Backend**: Next.js API Routes
- **AI/ML**:
    - Cohere: Embeddings, Chat streaming, Citations
    - OpenAI: Follow-up suggestion generation
- **Database**: Supabase (PostgreSQL with pgvector)
- **Document Processing**: Custom XML parsing, Cohere embeddings
- **Search**: Supabase Hybrid Search (Vector Similarity + FTS)

## Architecture

TusiCurezza follows a modern web application architecture:

1.  **Frontend (`src/components/dashboard/pdf-chat/`)**:
    *   Built with React and Material-UI for a responsive user interface.
    *   Features a split-view layout (`pdf-chat-view.tsx`) combining the chat (`pdf-chat-thread-messages-context.tsx`) and an interactive PDF viewer (`pdf-view.tsx`).
    *   Manages chat threads using React Context (`pdf-chat-threads-context.tsx`).
2.  **Backend (Next.js API Routes)**:
    *   Handles requests from the frontend, orchestrating interactions with AI services and the database.
    *   Houses the logic for the advanced chat implementation (`new-get-suggestions.ts`).
3.  **AI Core**:
    *   **Document Processing (`create-document-index.ts`)**: A robust RAG pipeline processes XML legal documents, chunking them hierarchically, generating embeddings (Cohere), and storing them in Supabase.
    *   **Chat Implementation (`new-get-suggestions.ts`)**: Manages the chat flow, performing hybrid searches, streaming Cohere responses, mapping citations, and generating follow-up questions (OpenAI).
4.  **Data Layer**:
    *   Supabase serves as the primary data store for vector embeddings, document metadata, and chat history.

## Notable Technical Achievements

- **Custom Legal Document RAG**: Developed a specialized pipeline preserving document hierarchy for enhanced retrieval accuracy.
- **Hybrid Search Implementation**: Combined semantic similarity (vectors) and keyword search (FTS) for robust information access.
- **Real-time Chat with Citations**: Built a streaming interface where citations are interactive and linked to the source document.
- **Citation Mapping**: Successfully mapped Cohere's citation data back to specific sections within the original XML documents.
- **Multilingual AI Handling**: Leveraged Cohere's capabilities to effectively process and understand Italian legal text.
- **Context Preservation**: Maintained conversational and document context through metadata and citation tracking.
