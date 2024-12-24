import { GoogleBookResult } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function searchComics(query: string): Promise<GoogleBookResult[]> {
  console.log('Searching for comics with query:', query);
  try {
    // Modification des paramètres de recherche pour mieux cibler les BDs françaises
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&langRestrict=fr&maxResults=20&printType=books&fields=items(id,volumeInfo)&key=AIzaSyD_20F0tXxQh7kZvZpAUk3GiHR0Qm4_RYE`
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

    // Filtrer pour ne garder que les résultats avec des informations suffisantes
    const filteredResults = data.items.filter((item: GoogleBookResult) => 
      item.volumeInfo &&
      item.volumeInfo.title &&
      (item.volumeInfo.authors?.length || item.volumeInfo.publisher)
    );

    console.log('Filtered results:', filteredResults);
    return filteredResults;
  } catch (error) {
    console.error('Error searching comics:', error);
    throw error;
  }
}

export async function getSeriesBooks(seriesId: string): Promise<GoogleBookResult[]> {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=series:${seriesId}&langRestrict=fr&maxResults=20`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching series books:', error);
    return [];
  }
}