import { Comic } from '@/lib/types';
import { ComicCard } from './ComicCard';

interface SeriesSectionProps {
  series: string;
  comics: Comic[];
  onAddMissing: (comic: Comic) => void;
  onCoverError: (comic: Comic) => void;
  showMissingOnly: boolean;
}

export function SeriesSection({ series, comics, onAddMissing, onCoverError, showMissingOnly }: SeriesSectionProps) {
  const filteredComics = showMissingOnly
    ? comics.filter(comic => comic.missing)
    : comics;

  if (filteredComics.length === 0) return null;

  return (
    <section className="series-section" id={`series-${series}`}>
      <h2 className="series-title font-merriweather text-2xl text-library-accent mb-4">
        {series}
      </h2>
      <div className="comic-grid">
        {filteredComics.map((comic) => (
          <ComicCard 
            key={comic.id} 
            comic={comic} 
            className={comic.missing ? 'missing' : ''}
            onAddMissing={onAddMissing}
            onCoverError={onCoverError}
          />
        ))}
      </div>
    </section>
  );
}