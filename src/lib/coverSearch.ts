import { searchComics } from './googleBooks';

export async function searchCoversByTitle(
  series: string,
  volume: number | undefined,
  author: string
): Promise<string[]> {
  try {
    console.log('Searching covers for:', { series, volume, author });
    const searchQuery = `${series} ${volume ? `tome ${volume}` : ''} ${author}`;
    const results = await searchComics(searchQuery);
    
    return results
      .filter(result => result.volumeInfo.imageLinks?.thumbnail)
      .map(result => result.volumeInfo.imageLinks!.thumbnail)
      .slice(0, 3);
  } catch (error) {
    console.error('Error searching covers:', error);
    return [];
  }
}

export async function updateMissingCovers() {
  try {
    const comicsRef = collection(db, 'comics');
    const q = query(comicsRef, where('coverUrl', '==', '/placeholder.svg'));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map(async (docSnapshot) => {
      const comic = docSnapshot.data();
      const covers = await searchCoversByTitle(
        comic.series || comic.title,
        comic.volume,
        comic.author
      );
      
      if (covers.length > 0) {
        await updateDoc(doc(db, 'comics', docSnapshot.id), {
          coverUrl: covers[0]
        });
        console.log(`Updated cover for ${comic.title}`);
      }
    });

    await Promise.all(updates);
  } catch (error) {
    console.error('Error updating covers:', error);
  }
}

// Démarrer la recherche périodique des couvertures
setInterval(updateMissingCovers, 5 * 60 * 1000); // Toutes les 5 minutes