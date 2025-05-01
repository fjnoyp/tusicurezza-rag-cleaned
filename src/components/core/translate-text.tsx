// Wrapper for translate-text-client to avoid SSR issues
import * as React from 'react';
import dynamic from 'next/dynamic';

const TranslateTextClient = dynamic(() => import('./translate-text-client'), { ssr: false });

interface TranslateTextProps {
  textKey: string;
  ns?: string;
}

function TranslateText({ ns, textKey }: TranslateTextProps): React.ReactElement {
  return <TranslateTextClient ns={ns} textKey={textKey} />;
}

export default TranslateText;
