import { GoogleBookResult } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function searchComics(query: string): Promise<GoogleBookResult[]> {
  console.log('Searching for comics with query:', query);
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}+subject:comics`
    );
    const data = await response.json();
    console.log('Search results:', data);
    return data.items || [];
  } catch (error) {
    console.error('Error searching comics:', error);
    return [];
  }
}