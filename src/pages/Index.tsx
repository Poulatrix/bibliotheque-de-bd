import { useState, useEffect } from 'react';
import { Comic } from '@/lib/types';
import { ComicGrid } from '@/components/ComicGrid';
import { AddComicModal } from '@/components/AddComicModal';
import { SearchComicModal } from '@/components/SearchComicModal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateMissingCovers } from '@/lib/coverSearch';

export default function Index() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    console.log("Setting up Firestore listener");
    const unsubscribe = onSnapshot(collection(db, 'comics'), (snapshot) => {
      const comicsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comic[];
      console.log("Comics data updated:", comicsData);
      setComics(comicsData);
    }, (error) => {
      console.error("Error fetching comics:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddComic = async (comic: Comic) => {
    try {
      await addDoc(collection(db, 'comics'), {
        ...comic,
        dateAdded: new Date(),
      });
    } catch (error) {
      console.error("Error adding comic:", error);
    }
  };

  const filteredComics = comics.filter(
    (comic) =>
      comic.title.toLowerCase().includes(filter.toLowerCase()) ||
      comic.author.toLowerCase().includes(filter.toLowerCase()) ||
      (comic.series && comic.series.toLowerCase().includes(filter.toLowerCase()))
  );

  useEffect(() => {
    updateMissingCovers();
  }, []);

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-3xl font-bold text-orange-600">
              Ma Bibliothèque
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              <AddComicModal onAddComic={handleAddComic} />
              <SearchComicModal onAddComic={handleAddComic} />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto pt-24">
        <ComicGrid comics={filteredComics} />
      </main>
    </div>
  );
}
