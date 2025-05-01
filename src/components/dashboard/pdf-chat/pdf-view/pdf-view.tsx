'use client';

import * as React from 'react';
import type { DocumentLoadEvent } from '@react-pdf-viewer/core';
import { SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import { usePdfView } from './pdf-view-context';

import './pdf-view.css';

import { logger } from '@/lib/default-logger';

export function PdfView(): React.ReactElement {
  const { pageNumber, file, setNumPages, search } = usePdfView();
  const pdfViewRef = React.useRef<HTMLDivElement>(null);
  const pageDivRefs = React.useRef<HTMLCollectionOf<Element> | null>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const searchPluginInstance = searchPlugin();

  const handleDocumentLoad = (e: DocumentLoadEvent): void => {
    const newNumPages: number = e.doc.numPages;
    setNumPages(newNumPages);

    pageDivRefs.current = pdfViewRef.current?.getElementsByClassName('rpv-core__inner-page') ?? null;
  };

  React.useEffect(() => {
    if (pageNumber) {
      const pageDiv = pageDivRefs.current?.[pageNumber - 1];
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [pageNumber]);

  function getSubstringsFromLongest(text: string): string[] {
    // Replace numbers followed by periods with just a period
    const cleanedText = text.replace(/\b\d+\.\s*/g, '. ');

    // Split the text based on commas and periods
    const segments = cleanedText
      .split(/[.,]/) // Split on commas and periods
      .map((segment) => segment.trim()) // Trim whitespace around each segment
      .filter((segment) => segment.length >= 3 || /^\d+$/.test(segment)); // Exclude short and numeric-only segments unless they're numbers

    // Sort segments by length, longest first
    segments.sort((a, b) => b.length - a.length);

    return segments;
  }

  // Effect to trigger search when `search` changes
  React.useEffect(() => {
    if (search) {
      const searchTerms = getSubstringsFromLongest(search);
      let found = false; // Track if the first match is found

      const searchForTerms = async (): Promise<void> => {
        for (const term of searchTerms) {
          if (found) break; // Stop further search if a match is found
          // eslint-disable-next-line no-await-in-loop -- Required
          const result = await searchPluginInstance.highlight([term]);
          if (result && result.length > 0) {
            found = true; // Stop further searching if a match is found
            logger.debug('First match found and highlighted:', term);
            break; // Exit the loop after finding the first match
          }
        }
      };

      void searchForTerms(); // Execute the search
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Rendering multiple times
  }, [search]);

  return (
    <div className="Example" ref={pdfViewRef}>
      <div className="Example__container">
        <div className="Example__container__document">
          {file ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                defaultScale={SpecialZoomLevel.PageFit}
                fileUrl={typeof file === 'string' ? file : URL.createObjectURL(file)}
                onDocumentLoad={handleDocumentLoad}
                plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
              />
            </Worker>
          ) : (
            <p>No file selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
