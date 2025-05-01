'use client';

import * as React from 'react'; 

function noop(): void {
    return undefined;
  }

export interface PdfContextValue {
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
  scrollTrigger: number;
  setScrollTrigger: (scrollTrigger: number) => void;
}

export const PdfContext = React.createContext<PdfContextValue>({
  pageNumber: 1,
  setPageNumber: noop,
  scrollTrigger: 0,
  setScrollTrigger: noop,
});

export interface PdfProviderProps {
  children: React.ReactNode;
}

export function PdfProvider({ children }: PdfProviderProps): React.JSX.Element {
  const [pageNumber, setPageNumber] = React.useState<number>(5);
  const [scrollTrigger, setScrollTrigger] = React.useState<number>(0);

  return (
    <PdfContext.Provider value={{ pageNumber, setPageNumber, scrollTrigger, setScrollTrigger }}>
      {children}
    </PdfContext.Provider>
  );
}