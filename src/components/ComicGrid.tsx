import { Comic } from '@/lib/types';
import { ComicCard } from './ComicCard';
import { AlphabetNav } from './AlphabetNav';
import { useRef } from 'react';

interface ComicGridProps {
  comics: Comic[];
}

interface SeriesGroup {
  [key: string]: Comic[];
}

export function ComicGrid({ comics }: ComicGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  // Trier les comics par série puis par titre
  const groupedComics = comics.reduce((acc: SeriesGroup, comic) => {
    const series = comic.series || 'Autres';
    if (!acc[series]) {
      acc[series] = [];
    }
    acc[series].push(comic);
    return acc;
  }, {});

  // Trier les séries par ordre alphabétique
  const sortedSeries = Object.keys(groupedComics).sort((a, b) => 
    a.localeCompare(b, 'fr', { ignorePunctuation: true })
  );

  // Trier les comics dans chaque série
  sortedSeries.forEach(series => {
    groupedComics[series].sort((a, b) => 
      a.title.localeCompare(b.title, 'fr', { ignorePunctuation: true })
    );
  });

  const scrollToLetter = (letter: string) => {
    const sections = gridRef.current?.getElementsByClassName('series-section');
    if (sections) {
      for (const section of sections) {
        const sectionTitle = section.getElementsByTagName('h2')[0].textContent;
        if (sectionTitle && sectionTitle.charAt(0).toUpperCase() === letter) {
          section.scrollIntoView({ behavior: 'smooth' });
          break;
        }
      }
    }
  };

  return (
    <div ref={gridRef} className="relative pb-8">
      <AlphabetNav onLetterClick={scrollToLetter} />
      {sortedSeries.map((series) => (
        <section key={series} className="series-section" id={`series-${series}`}>
          <h2 className="series-title">{series}</h2>
          <div className="comic-grid">
            {groupedComics[series].map((comic) => (
              <ComicCard key={comic.id} comic={comic} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}