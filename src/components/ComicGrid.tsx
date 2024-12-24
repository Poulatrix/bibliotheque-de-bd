import { Comic } from '@/lib/types';
import { ComicCard } from './ComicCard';

interface ComicGridProps {
  comics: Comic[];
}

export function ComicGrid({ comics }: ComicGridProps) {
  return (
    <div className="comic-grid">
      {comics.map((comic) => (
        <ComicCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
}