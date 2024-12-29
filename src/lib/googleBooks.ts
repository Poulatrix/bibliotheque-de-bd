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
      throw error;
    }
  });
}

export async function searchByISBN(isbn: string): Promise<GoogleBookResult[]> {
  console.log('Searching by ISBN:', isbn);
  const sanitizedIsbn = isbn.replace(/:/g, '');
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
        throw error; // Let the rate limiter handle it
      }
      return null;
    }
  });
}