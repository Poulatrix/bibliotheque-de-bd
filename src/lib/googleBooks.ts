import { RateLimiter } from './rateLimit';

const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

const sanitizeUrl = (url: string): string => {
  return url.replace(':/', '/').replace(/([^:])\/\/+/g, '$1/');
};

export function convertEANtoISBN(ean: string): string | null {
  if (ean.length !== 13 || !/^\d+$/.test(ean)) {
    return null;
  }

  // Remove the EAN prefix (usually 978 or 979)
  const isbn9 = ean.slice(3, 12);

  // Calculate the ISBN check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn9[i]) * (10 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 11;
  const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

  return isbn9 + checkChar;
}

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
    return data.items || [];
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    return [];
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