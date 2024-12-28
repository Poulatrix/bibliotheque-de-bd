import { useState, useEffect } from 'react';
import { Comic, GoogleBookResult } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getSeriesBooks } from '@/lib/googleBooks';
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComicDetailProps {
  comic: Comic;
  open: boolean;
  onClose: () => void;
  onAddComic?: (comic: Comic) => void;
}

export function ComicDetail({ comic, open, onClose, onAddComic }: ComicDetailProps) {
  const [seriesBooks, setSeriesBooks] = useState<GoogleBookResult[]>([]);

  useEffect(() => {
    if (comic.series && open) {
      getSeriesBooks(comic.series).then(books => {
        setSeriesBooks(books.filter(book => book.id !== comic.id));
      });
    }
  }, [comic.series, open]);

  const handleAddToLibrary = (book: GoogleBookResult) => {
    if (onAddComic) {
      const newComic: Comic = {
        id: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.[0] || "Auteur inconnu",
        series: comic.series,
        year: book.volumeInfo.publishedDate ? 
          parseInt(book.volumeInfo.publishedDate.substring(0, 4)) : 
          undefined,
        coverUrl: book.volumeInfo.imageLinks?.thumbnail || '/placeholder.svg',
        description: book.volumeInfo.description,
      };
      onAddComic(newComic);
      toast.success("BD ajoutée à votre bibliothèque");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-library-paper p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-merriweather text-2xl">
            {comic.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="p-6 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img
              src={comic.coverUrl}
              alt={comic.title}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-library-accent">Série</h3>
                <p>{comic.series || "Standalone"}</p>
              </div>
              <div>
                <h3 className="font-bold text-library-accent">Auteur</h3>
                <p>{comic.author}</p>
              </div>
              {comic.year && (
                <div>
                  <h3 className="font-bold text-library-accent">Année</h3>
                  <p>{comic.year}</p>
                </div>
              )}
              {comic.description && (
                <div>
                  <h3 className="font-bold text-library-accent">Description</h3>
                  <p className="text-sm text-library-muted">{comic.description}</p>
                </div>
              )}
            </div>
          </div>

          {seriesBooks.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-xl mb-4">Autres tomes de la série</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {seriesBooks.map((book) => (
                  <div key={book.id} className="relative group">
                    <img
                      src={book.volumeInfo.imageLinks?.thumbnail || '/placeholder.svg'}
                      alt={book.volumeInfo.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      onClick={() => handleAddToLibrary(book)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      variant="secondary"
                      size="icon"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}