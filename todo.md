# TODO August 20

## Move to react-pdf-viewer
- The current free solution has limited functionality, no built in text search, broken screen rescale 
- Switch to using react-pdf-viewer 
- Add the text search plugin 
- Make sure to follow proper code structure separating business logic from ui (see how the existing PDFView and PdfViewContext is setup as an example)

## If you can - remove the `/* eslint-disable @typescript-eslint/no-unsafe-assignment -- unknown it */` comments from the `new-get-suggestions.ts` file and fix the code accordingly. If you can do the same for create-document-index.ts, that would be great as well. 

## Clean and integrate the `new-get-suggestions.ts` code as an API call in the website, we no longer want to use the old ask-pdf-chat.ts file. Please follow the structure of ask-pdf-chat by adding request/response types and zod type validation as necessary. 

## Improve citation grouping
- Group together Cohere citations referencing the same document id
- Convert citations into a list of document ids with the referenced text 
- Include these citations as clickable buttons in the ai chat response 
- When clicked, move the pdf view to the referenced document id, with referenced text highlighted 

ie: 
CohereCitation
    documentId
    list of reference text 

When clicked, use the react-pdf-viewer's text search plugin to move the view to the correct location 
Use its highlight feature to highlight the proper text 

## Fix Vercel deployment issues related to create-document-index.ts

Failed to compile.
./create-document-index.ts:89:3
Type error: Type '{ id: string; text: string; metadata: { articleNumber: string; chapterName: string; }; }[]' is not assignable to type 'ContentGroup[]'.
  Type '{ id: string; text: string; metadata: { articleNumber: string; chapterName: string; }; }' is not assignable to type 'ContentGroup'.
    The types of 'metadata.articleNumber' are incompatible between these types.
      Type 'string' is not assignable to type 'number'.
  87 | // Function to extract and group content with metadata
  88 | function extractContent(parsedXML: ParsedXML): ContentGroup[] {
> 89 |   return parsedXML.NIR.DecretoLegislativo[0].articolato[0].capo.flatMap((capo) => {
     |   ^
  90 |     //const chapterId = capo.$.id;
  91 |     const chapterName = capo.num[0];
  92 |
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
Error: Command "yarn run build" exited with 1
