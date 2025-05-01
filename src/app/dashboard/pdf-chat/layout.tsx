import * as React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return <>{children}</>;
}

/*
export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    
    <ChatProvider contacts={contacts} messages={messages} threads={threads}>
      <ChatView>{children}</ChatView>
    </ChatProvider>
    
  );
}
*/
