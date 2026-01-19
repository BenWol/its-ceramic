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

  // Helper to check if value is empty or placeholder
  const isEmpty = (value: string | undefined): boolean => {
    if (!value) return true;
    const trimmed = value.trim();
    return trimmed === '' || trimmed === '-' || trimmed === '—';
  };

  // Format field indicator for placeholder content
  const fieldIndicator = (key: string, field: string, fallback?: string): string => {
    const indicator = `[${key}:${field}]`;
    return fallback ? `${indicator} ${fallback}` : indicator;
  };

  // Helper to get image URL by key, with optional fallback
  const getImage = (key: string, fallback?: string): string => {
    const value = content[key]?.image;
    return isEmpty(value) ? (fallback || '') : value!;
  };

  // Helper to get alt text
  const getAlt = (key: string, fallback?: string): string => {
    const value = content[key]?.alt;
    return isEmpty(value) ? (fallback || '') : value!;
  };

  // Helper to get title
  const getTitle = (key: string, fallback?: string): string => {
    const value = content[key]?.title;
    if (isEmpty(value)) {
      return fieldIndicator(key, 'title', fallback);
    }
    return value!;
  };

  // Helper to get description
  const getDescription = (key: string, fallback?: string): string => {
    const value = content[key]?.description;
    if (isEmpty(value)) {
      return fieldIndicator(key, 'description', fallback);
    }
    return value!;
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
