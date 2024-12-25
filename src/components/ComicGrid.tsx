import { Comic } from '@/lib/types';
import { ComicCard } from './ComicCard';
import { AlphabetNav } from './AlphabetNav';
import { useRef, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ComicGridProps {
  comics: Comic[];
}

interface SeriesGroup {
  [key: string]: Comic[];
}

export function ComicGrid({ comics }: ComicGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showMissingOnly, setShowMissingOnly] = useState(false);

  // Trier les comics par série puis par titre
  const groupedComics = comics.reduce((acc: SeriesGroup, comic) => {
    const series = comic.series || 'Autres';
    if (!acc[series]) {
      acc[series] = [];
    }
    // Vérifier si le comic existe déjà dans la série
    const exists = acc[series].some(c => c.id === comic.id);
    if (!exists) {
      acc[series].push(comic);
    }
    return acc;
  }, {});

  // Trier les séries par ordre alphabétique
  const sortedSeries = Object.keys(groupedComics).sort((a, b) => 
    a.localeCompare(b, 'fr', { ignorePunctuation: true })
  );

  // Trier les comics dans chaque série et ajouter les tomes manquants
  sortedSeries.forEach(series => {
    groupedComics[series].sort((a, b) => {
      if (a.volume && b.volume) {
        // Convertir les volumes en nombres pour un tri correct
        const volA = parseInt(a.volume.toString());
        const volB = parseInt(b.volume.toString());
        return volA - volB;
      }
      return a.title.localeCompare(b.title, 'fr', { ignorePunctuation: true });
    });

    // Ajouter les tomes manquants
    if (series !== 'Autres') {
      const volumes = groupedComics[series]
        .map(c => c.volume)
        .filter(v => v !== undefined)
        .map(v => parseInt(v!.toString()));
      
      if (volumes.length > 0) {
        const maxVol = Math.max(...volumes);
        for (let i = 1; i <= maxVol; i++) {
          if (!volumes.includes(i)) {
            groupedComics[series].push({
              id: `missing-${series}-${i}`,
              title: `Tome ${i}`,
              series,
              volume: i,
              author: groupedComics[series][0].author,
              coverUrl: '/placeholder.svg',
              missing: true
            });
          }
        }
        // Re-trier après avoir ajouté les tomes manquants
        groupedComics[series].sort((a, b) => {
          if (a.volume && b.volume) {
            return parseInt(a.volume.toString()) - parseInt(b.volume.toString());
          }
          return 0;
        });
      }
    }
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
      <div className="sticky top-0 z-50 bg-library-background py-4">
        <AlphabetNav onLetterClick={scrollToLetter} />
        <div className="flex items-center justify-end gap-2 mb-4">
          <Switch
            id="missing-only"
            checked={showMissingOnly}
            onCheckedChange={setShowMissingOnly}
          />
          <Label htmlFor="missing-only">Afficher uniquement les tomes manquants</Label>
        </div>
      </div>
      {sortedSeries.map((series) => {
        const filteredComics = showMissingOnly
          ? groupedComics[series].filter(comic => comic.missing)
          : groupedComics[series];

        if (filteredComics.length === 0) return null;

        return (
          <section key={series} className="series-section" id={`series-${series}`}>
            <h2 className="series-title">{series}</h2>
            <div className="comic-grid">
              {filteredComics.map((comic) => (
                <ComicCard 
                  key={comic.id} 
                  comic={comic} 
                  className={comic.missing ? 'missing' : ''}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}