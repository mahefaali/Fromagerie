import { createContext, type ReactNode, useContext } from "react";
import { createPortal } from "react-dom";

type PageTabsHost = HTMLElement | null | undefined;

const PageTabsHostContext = createContext<PageTabsHost>(undefined);

interface PageTabsHostProviderProps {
  children: ReactNode;
  host: HTMLElement | null;
}

export function PageTabsHostProvider({ children, host }: PageTabsHostProviderProps) {
  return (
    <PageTabsHostContext.Provider value={host}>
      {children}
    </PageTabsHostContext.Provider>
  );
}

export function PageTabsPortal({ children }: { children: ReactNode }) {
  const host = useContext(PageTabsHostContext);

  // Keep page components usable in isolation (Storybook and unit tests).
  if (host === undefined) return children;
  if (host === null) return null;

  return createPortal(children, host);
}
