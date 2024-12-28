import { useState, useEffect } from 'react';
import { Comic } from '@/lib/types';
import { ComicGrid } from '@/components/ComicGrid';
import { AddComicModal } from '@/components/AddComicModal';
import { SearchComicModal } from '@/components/SearchComicModal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { collection, onSnapshot, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateMissingCovers } from '@/lib/coverSearch';
import { toast } from 'sonner';

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
      console.log("Adding comic to database:", comic);
      
      // Vérifier si la BD existe déjà
      const existingComicsQuery = query(
        collection(db, 'comics'),
        where('title', '==', comic.title),
        where('author', '==', comic.author)
      );
      
      const existingComics = await getDocs(existingComicsQuery);
      
      if (!existingComics.empty) {
        toast.error("Cette BD existe déjà dans votre bibliothèque");
        return;
      }

      // S'assurer que tous les champs sont définis
      const comicToAdd = {
        ...comic,
        series: comic.series || 'Autres',
        dateAdded: new Date(),
        coverUrl: comic.coverUrl || '/placeholder.svg'
      };

      await addDoc(collection(db, 'comics'), comicToAdd);
      toast.success("BD ajoutée avec succès");
    } catch (error) {
      console.error("Error adding comic:", error);
      toast.error("Erreur lors de l'ajout de la BD");
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
    const interval = setInterval(updateMissingCovers, 5 * 60 * 1000);
    return () => clearInterval(interval);
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