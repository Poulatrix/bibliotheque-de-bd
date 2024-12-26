import { GoogleBookResult } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function searchComics(query: string): Promise<GoogleBookResult[]> {
  console.log('Searching for comics with query:', query);
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&langRestrict=fr&maxResults=20&printType=books&fields=items(id,volumeInfo)`
    );
    
    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error('Erreur lors de la recherche');
    }

    const data = await response.json();
    console.log('Raw search results:', data);
    
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
}

export async function searchByISBN(isbn: string): Promise<GoogleBookResult[]> {
  console.log('Searching by ISBN:', isbn);
  return searchComics(`isbn:${isbn}`);
}

export async function getSeriesBooks(seriesId: string): Promise<GoogleBookResult[]> {
  console.log('Fetching series books for:', seriesId);
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=intitle:"${encodeURIComponent(seriesId)}"&langRestrict=fr&maxResults=20&printType=books&fields=items(id,volumeInfo)`
    );

    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('Series books raw results:', data);

    if (!data.items) {
      console.log('No series books found');
      return [];
    }

    const filteredResults = data.items.filter((item: GoogleBookResult) => 
      item.volumeInfo &&
      item.volumeInfo.title &&
      (item.volumeInfo.authors?.length)
    );

    console.log('Filtered series books:', filteredResults);
    return filteredResults;
  } catch (error) {
    console.error('Error fetching series books:', error);
    return [];
  }
}

export function convertEANtoISBN(ean: string): string | null {
  if (ean.length !== 13 || !ean.startsWith('978')) return null;
  
  const isbn9 = ean.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn9[i]) * (10 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 11;
  return isbn9 + (checkDigit === 10 ? 'X' : checkDigit.toString());
}

export async function searchCoverImage(title: string, author: string): Promise<string | null> {
  console.log('Searching cover image for:', title, author);
  try {
    // Use the Books API instead of Custom Search API
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(`${title} ${author}`)}&langRestrict=fr&maxResults=1&printType=books&fields=items(volumeInfo(imageLinks))`
    );

    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Cover search results:', data);

    if (!data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail) {
      console.log('No cover image found');
      return null;
    }

    // Get the highest quality image available
    const imageLinks = data.items[0].volumeInfo.imageLinks;
    return imageLinks.extraLarge || imageLinks.large || imageLinks.medium || imageLinks.thumbnail || null;
  } catch (error) {
    console.error('Error searching cover image:', error);
    return null;
  }
}