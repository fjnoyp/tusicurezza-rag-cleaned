import type { JSX } from 'react';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface PdfViewContextProps {
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  scrollToPage: (pageNumber: number) => void;
  file: string | File | null;
  setFile: (file: string | File | null) => void;
  numPages: number | undefined;
  setNumPages: (numPages: number) => void;
  setSearch: (text: string) => void;
  search?: string;
}

const PdfViewContext = createContext<PdfViewContextProps | undefined>(undefined);

export function PdfViewProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [pageNumber, setPageNumber] = useState(1);

  // TODO not working need to find fix
  // Function to determine the initial file based on language

  const getInitialFile = (): string => {
    /*
    const language = i18n?.language || 'en'; // Default to 'en' if i18n or language is undefined
    if (language.startsWith('en')) {
      return '/pdfs/NazionaleLavoroEN.pdf';
    } else if (language.startsWith('it')) {
      return '/pdfs/NazionaleLavoroIT.pdf';
    }
    */
    //return '/pdfs/NazionaleLavoroIT.pdf';
    return '/pdfs/Decree2008IT.pdf';
  };

  const [file, setFile] = useState<string | File | null>(getInitialFile());

  const [numPages, setNumPages] = useState<number>();
  const [search, setSearch] = useState<string>();

  const scrollToPage = useCallback((targetPageNumber: number) => {
    setPageNumber(targetPageNumber);
  }, []);

  return (
    <PdfViewContext.Provider
      value={{ pageNumber, setPageNumber, scrollToPage, file, setFile, numPages, setNumPages, search, setSearch }}
    >
      {children}
    </PdfViewContext.Provider>
  );
}

export const usePdfView = (): PdfViewContextProps => {
  const context = useContext(PdfViewContext);
  if (context === undefined) {
    throw new Error('usePdfView must be used within a PdfViewProvider');
  }
  return context;
};
