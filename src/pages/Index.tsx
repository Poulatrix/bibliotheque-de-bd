import { useState, useEffect } from 'react';
import { Comic } from '@/lib/types';
import { ComicGrid } from '@/components/ComicGrid';
import { AddComicModal } from '@/components/AddComicModal';
import { SearchComicModal } from '@/components/SearchComicModal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

  const handleAddComic = (comic: Comic) => {
    setComics((prev) => [...prev, comic]);
  };

  const filteredComics = comics.filter(
    (comic) =>
      comic.title.toLowerCase().includes(filter.toLowerCase()) ||
      comic.author.toLowerCase().includes(filter.toLowerCase()) ||
      (comic.series && comic.series.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-library-background">
      <header className="bg-library-paper shadow-sm">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-merriweather font-bold text-library-text mb-6">
            Ma Bibliothèque de BD
          </h1>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <AddComicModal onAddComic={handleAddComic} />
              <SearchComicModal onAddComic={handleAddComic} />
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Filtrer par titre, auteur ou série..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <ComicGrid comics={filteredComics} />
        {filteredComics.length === 0 && (
          <div className="text-center text-library-muted py-12">
            {comics.length === 0
              ? "Votre bibliothèque est vide. Commencez par ajouter des BD!"
              : "Aucune BD ne correspond à votre recherche."}
          </div>
        )}
      </main>
    </div>
  );
}