import { Comic } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { ComicDetail } from './ComicDetail';
import { cn } from '@/lib/utils';

interface ComicCardProps {
  comic: Comic;
  className?: string;
}

export function ComicCard({ comic, className }: ComicCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <Card 
        className={cn("comic-card cursor-pointer hover:shadow-lg transition-shadow", className)}
        onClick={() => setShowDetail(true)}
      >
        <CardContent className="p-0 aspect-[2/3] relative">
          <img
            src={comic.coverUrl}
            alt={comic.title}
            className="w-full h-full object-cover rounded-t-lg"
            style={{ maxWidth: '150px' }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <h3 className="text-white font-merriweather text-sm font-bold truncate">
              {comic.title}
            </h3>
            <p className="text-white/80 text-xs truncate">{comic.author}</p>
          </div>
        </CardContent>
      </Card>
      <ComicDetail
        comic={comic}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  );
}