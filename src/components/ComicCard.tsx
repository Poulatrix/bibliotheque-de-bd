import { Comic } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { ComicDetail } from './ComicDetail';

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <Card 
        className="comic-card cursor-pointer hover:shadow-lg transition-shadow"
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