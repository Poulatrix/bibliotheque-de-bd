import { Comic } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { ComicDetail } from './ComicDetail';
import { cn } from '@/lib/utils';
import { Plus, Check, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ComicCardProps {
  comic: Comic;
  className?: string;
  onAddMissing?: (comic: Comic) => void;
  onCoverError?: (comic: Comic) => void;
}

export function ComicCard({ comic, className, onAddMissing, onCoverError }: ComicCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const handleClick = () => {
    if (!comic.missing) {
      setShowDetail(true);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (comic.missing && onAddMissing) {
      onAddMissing(comic);
    }
  };

  const handleReadToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!comic.missing && comic.id) {
      try {
        await updateDoc(doc(db, 'comics', comic.id), {
          isRead: !comic.isRead
        });
      } catch (error) {
        console.error('Error updating read status:', error);
      }
    }
  };

  const handleCoverError = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCoverError) {
      onCoverError(comic);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "comic-card cursor-pointer hover:shadow-lg transition-shadow relative",
              className,
              comic.missing && "opacity-50 hover:opacity-80"
            )}
            onClick={handleClick}
          >
            <CardContent className="p-0 aspect-[2/3] relative">
              <img
                src={comic.coverUrl}
                alt={comic.title}
                className="w-full h-full object-cover rounded-t-lg"
                style={{ maxWidth: '150px' }}
              />
              {!comic.missing && (
                <button
                  onClick={handleReadToggle}
                  className="absolute top-2 left-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <Check className={cn(
                    "h-4 w-4",
                    comic.isRead ? "text-green-500" : "text-gray-400"
                  )} />
                </button>
              )}
              {!comic.missing && (
                <button
                  onClick={handleCoverError}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              )}
              {comic.missing && (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  onClick={handleAddClick}
                >
                  <Plus className="h-8 w-8 text-white bg-black/50 rounded-full p-1" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <h3 className="text-white font-merriweather text-sm font-bold truncate">
                  {comic.title}
                </h3>
                <p className="text-white/80 text-xs truncate">{comic.author}</p>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {comic.series && comic.volume 
              ? `${comic.series} - Tome ${comic.volume}`
              : comic.title
            }
          </p>
        </TooltipContent>
      </Tooltip>
      <ComicDetail
        comic={comic}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </TooltipProvider>
  );
}