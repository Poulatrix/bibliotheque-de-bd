import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Comic, GoogleBookResult } from '@/lib/types';
import { Search, Plus } from 'lucide-react';
import { searchComics, searchCoverImage } from '@/lib/googleBooks';
import { toast } from 'sonner';

interface SearchComicModalProps {
  onAddComic: (comic: Comic) => void;
}

export function SearchComicModal({ onAddComic }: SearchComicModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await searchComics(query);
      setResults(searchResults);
      console.log('Search completed:', searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddComic = async (result: GoogleBookResult) => {
    try {
      console.log("Processing comic for addition:", result);
      
      // Extraire le nom de la série et le numéro de tome du titre
      const titleParts = result.volumeInfo.title.split(' - ');
      let series = titleParts.length > 1 ? titleParts[0] : 'Autres';
      let volume: number | undefined;
      
      // Recherche du numéro de tome dans le titre
      const volumeMatch = result.volumeInfo.title.match(/(?:T|Tome|Vol\.?)\s*(\d+)/i);
      if (volumeMatch) {
        volume = parseInt(volumeMatch[1]);
      }

      // Si on n'a pas trouvé de série mais qu'on a un volume, on utilise le titre comme série
      if (series === 'Autres' && volume) {
        series = result.volumeInfo.title.split(/(?:T|Tome|Vol\.?)/i)[0].trim();
      }

      const comic: Comic = {
        id: result.id,
        title: result.volumeInfo.title,
        series: series,
        volume: volume,
        author: result.volumeInfo.authors?.[0] || "Auteur inconnu",
        year: result.volumeInfo.publishedDate ? 
          parseInt(result.volumeInfo.publishedDate.substring(0, 4)) : 
          undefined,
        coverUrl: result.volumeInfo.imageLinks?.thumbnail || '/placeholder.svg',
        description: result.volumeInfo.description || '',
      };

      console.log("Prepared comic object:", comic);

      // Si pas de couverture, rechercher une image
      if (!result.volumeInfo.imageLinks?.thumbnail) {
        const searchTitle = `${comic.series} ${comic.volume ? `Tome ${comic.volume}` : ''} ${comic.title}`.trim();
        console.log("Searching for cover with title:", searchTitle);
        const coverUrl = await searchCoverImage(searchTitle, comic.author);
        if (coverUrl) {
          comic.coverUrl = coverUrl;
        }
      }

      onAddComic(comic);
      setOpen(false);
      toast.success("BD ajoutée avec succès!");
    } catch (error) {
      console.error("Error processing comic:", error);
      toast.error("Erreur lors de l'ajout de la BD");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Rechercher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-library-paper">
        <DialogHeader>
          <DialogTitle className="font-merriweather">Rechercher une BD</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titre, auteur..."
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="grid grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex gap-4 p-4 border rounded-lg bg-white hover:bg-gray-50"
            >
              <img
                src={result.volumeInfo.imageLinks?.thumbnail || '/placeholder.svg'}
                alt={result.volumeInfo.title}
                className="w-24 h-32 object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold">{result.volumeInfo.title}</h3>
                <p className="text-sm text-gray-600">
                  {result.volumeInfo.authors?.[0]}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAddComic(result)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}