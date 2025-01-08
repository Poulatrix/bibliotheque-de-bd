import { RateLimiter } from './rateLimit';

const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

const sanitizeUrl = (url: string): string => {
  return url.replace(':/', '/').replace(/([^:])\/\/+/g, '$1/');
};

export async function searchComics(query: string) {
  const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  const params = new URLSearchParams({
    q: query,
    langRestrict: 'fr',
    maxResults: '10',
    printType: 'books'
  });

  const url = sanitizeUrl(`${baseUrl}?${params.toString()}`);
  console.log('Searching comics with URL:', url);

  try {
    const response = await rateLimiter.schedule(() => fetch(url));
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching comics:', error);
    return [];
  }
}

export async function searchByISBN(isbn: string) {
  const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  const params = new URLSearchParams({
    q: `isbn:${isbn}`,
    langRestrict: 'fr',
    maxResults: '1',
    printType: 'books'
  });

  const url = sanitizeUrl(`${baseUrl}?${params.toString()}`);
  console.log('Searching by ISBN with URL:', url);

  try {
    const response = await rateLimiter.schedule(() => fetch(url));
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.items?.[0] || null;
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    return null;
  }
}

export async function searchCoverImage(query: string): Promise<string | null> {
  const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
  const params = new URLSearchParams({
    q: query,
    langRestrict: 'fr',
    maxResults: '1',
    printType: 'books',
    fields: 'items(volumeInfo(imageLinks))'
  });

  const url = sanitizeUrl(`${baseUrl}?${params.toString()}`);
  console.log('Searching cover image with URL:', url);

  try {
    const response = await rateLimiter.schedule(() => fetch(url));
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || null;
  } catch (error) {
    console.error('Error searching cover image:', error);
    return null;
  }
}