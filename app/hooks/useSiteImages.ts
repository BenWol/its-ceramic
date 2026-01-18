import useSWR from 'swr';

export type SiteContent = {
  id: string;
  key: string;
  image: string;
  alt?: string;
  title?: string;
  description?: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSiteContent() {
  const { data, error, isLoading } = useSWR('/api/site-images', fetcher, {
    revalidateOnFocus: false,
  });

  const content: Record<string, SiteContent> = data?.content ?? {};

  // Helper to get image URL by key, with optional fallback
  const getImage = (key: string, fallback?: string): string => {
    return content[key]?.image || fallback || '';
  };

  // Helper to get alt text
  const getAlt = (key: string, fallback?: string): string => {
    return content[key]?.alt || fallback || '';
  };

  // Helper to get title
  const getTitle = (key: string, fallback?: string): string => {
    return content[key]?.title || fallback || '';
  };

  // Helper to get description
  const getDescription = (key: string, fallback?: string): string => {
    return content[key]?.description || fallback || '';
  };

  // Get full content object
  const getContent = (key: string): SiteContent | undefined => {
    return content[key];
  };

  return {
    content,
    getImage,
    getAlt,
    getTitle,
    getDescription,
    getContent,
    isLoading,
    error,
  };
}

// Keep old name for backwards compatibility
export const useSiteImages = useSiteContent;
