import { GoogleBookResult } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function searchComics(query: string): Promise<GoogleBookResult[]> {
  console.log('Searching for comics with query:', query);
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}+subject:comics&langRestrict=fr&maxResults=20`
    );
    const data = await response.json();
    console.log('Search results:', data);
    
    // Filtrer pour ne garder que les résultats avec des informations suffisantes
    const filteredResults = (data.items || []).filter((item: GoogleBookResult) => 
      item.volumeInfo.title && 
      (item.volumeInfo.authors?.length || item.volumeInfo.publisher)
    );

    // Grouper par série si possible
    const groupedResults = filteredResults.reduce((acc: any, item: GoogleBookResult) => {
      const seriesInfo = item.volumeInfo.seriesInfo;
      if (seriesInfo) {
        if (!acc[seriesInfo.seriesId]) {
          acc[seriesInfo.seriesId] = [];
        }
        acc[seriesInfo.seriesId].push(item);
      } else {
        if (!acc.standalone) acc.standalone = [];
        acc.standalone.push(item);
      }
      return acc;
    }, {});

    return filteredResults;
  } catch (error) {
    console.error('Error searching comics:', error);
    return [];
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