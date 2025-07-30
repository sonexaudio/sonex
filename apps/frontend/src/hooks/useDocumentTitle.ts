// This hook updates the document title in the browser tab to the provided title.
// It also cleans up the effect by resetting the original Sonex title when the component unmounts.

import { useEffect, useRef } from 'react';

export function useDocumentTitle(title: string): void {
    const originalTitle = useRef(document.title);
    useEffect(() => {
        document.title = title;
        return () => {
            document.title = originalTitle.current;
        };
    }, [title]);

    // I don't need to return anything from this hook.
}