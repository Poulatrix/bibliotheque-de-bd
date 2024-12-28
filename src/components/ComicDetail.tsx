import { Comic } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComicDetailProps {
  comic: Comic;
  open: boolean;
  onClose: () => void;
}

export function ComicDetail({ comic, open, onClose }: ComicDetailProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-orange-600">
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
                <h3 className="font-bold text-orange-600">Série</h3>
                <p className="text-gray-700">{comic.series || "Standalone"}</p>
              </div>
              <div>
                <h3 className="font-bold text-orange-600">Auteur</h3>
                <p className="text-gray-700">{comic.author}</p>
              </div>
              {comic.year && (
                <div>
                  <h3 className="font-bold text-orange-600">Année</h3>
                  <p className="text-gray-700">{comic.year}</p>
                </div>
              )}
              {comic.volume && (
                <div>
                  <h3 className="font-bold text-orange-600">Tome</h3>
                  <p className="text-gray-700">{comic.volume}</p>
                </div>
              )}
              {comic.description && (
                <div>
                  <h3 className="font-bold text-orange-600">Synopsis</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{comic.description}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}