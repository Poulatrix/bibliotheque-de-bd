import { GoogleBookResult } from './types';
import { rateLimiter } from './rateLimit';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

async function makeRequest(url: string) {
  console.log('Making request to:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    console.error('API response error:', response.status, response.statusText);
    throw {
      status: response.status,
      message: `API request failed with status ${response.status}`,
      url
    };
  }

  const data = await response.json();
  console.log('API response:', data);
  return data;
}

export function convertEANtoISBN(ean: string): string | null {
  if (ean.length !== 13 || !/^\d+$/.test(ean)) {
    return null;
  }

  // Remove EAN prefix (usually 978 or 979 for books)
  const isbn9 = ean.slice(3, 12);

  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn9[i]) * (10 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 11;
  const checkChar = checkDigit === 10 ? 'X' : checkDigit.toString();

  return isbn9 + checkChar;
}

export async function searchComics(query: string): Promise<GoogleBookResult[]> {
  console.log('Searching for comics with query:', query);
  
  return rateLimiter.enqueue(async () => {
    try {
      const sanitizedQuery = encodeURIComponent(query.replace(/:/g, ''));
      const url = `${GOOGLE_BOOKS_API}?q=${sanitizedQuery}&langRestrict=fr&maxResults=20&printType=books&fields=items(id,volumeInfo)`;
      
      const data = await makeRequest(url);
      
      if (!data.items) {
        console.log('No results found');
        return [];
      }

      const filteredResults = data.items.filter((item: GoogleBookResult) => 
        item.volumeInfo &&
        item.volumeInfo.title &&
        (item.volumeInfo.authors?.length)
      );

      console.log('Filtered results:', filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Error searching comics:', error);
      if (error?.status === 429) {
        // If we hit rate limit, wait and retry
        console.log('Rate limit hit, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        return searchComics(query);
      }
      throw error;
    }
  });
}

export async function searchByISBN(isbn: string): Promise<GoogleBookResult[]> {
  console.log('Searching by ISBN:', isbn);
  const sanitizedIsbn = isbn.replace(/[^0-9X]/gi, '');
  return searchComics(`isbn:${sanitizedIsbn}`);
}

export async function searchCoverImage(title: string, author: string): Promise<string | null> {
  console.log('Searching cover image for:', title, author);
  
  return rateLimiter.enqueue(async () => {
    try {
      const sanitizedQuery = encodeURIComponent(`${title} ${author}`.replace(/:/g, ''));
      const url = `${GOOGLE_BOOKS_API}?q=${sanitizedQuery}&langRestrict=fr&maxResults=1&printType=books&fields=items(volumeInfo(imageLinks))`;
      
      const data = await makeRequest(url);
      console.log('Cover search results:', data);

      if (!data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
        console.log('No cover image found');
        return null;
      }

      const imageLinks = data.items[0].volumeInfo.imageLinks;
      return imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null;
    } catch (error) {
      console.error('Error searching cover image:', error);
      if (error?.status === 429) {
        // If we hit rate limit, wait and retry
        console.log('Rate limit hit, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
        return searchCoverImage(title, author);
      }
      return null;
    }
  });
}