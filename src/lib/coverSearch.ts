import { searchCoverImage } from './googleBooks';
import { db } from './firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function updateMissingCovers() {
  try {
    const comicsRef = collection(db, 'comics');
    const q = query(comicsRef, where('coverUrl', '==', '/placeholder.svg'));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map(async (docSnapshot) => {
      const comic = docSnapshot.data();
      const coverUrl = await searchCoverImage(comic.title, comic.author);
      
      if (coverUrl) {
        await updateDoc(doc(db, 'comics', docSnapshot.id), {
          coverUrl: coverUrl
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