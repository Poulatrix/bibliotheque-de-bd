import { Comic } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ComicDetailProps {
  comic: Comic;
  open: boolean;
  onClose: () => void;
}

export function ComicDetail({ comic, open, onClose }: ComicDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-2xl">
            {comic.title}
          </DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}