import { Comic } from '@/lib/types';
import { useRef, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { FilterSection } from './FilterSection';
import { SeriesSection } from './SeriesSection';

interface ComicGridProps {
  comics: Comic[];
}

interface SeriesGroup {
  [key: string]: Comic[];
}

export function ComicGrid({ comics }: ComicGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const { toast } = useToast();

  const handleAddMissing = async (comic: Comic) => {
    try {
      console.log("Adding missing comic:", comic);
      const docRef = await addDoc(collection(db, 'comics'), {
        ...comic,
        missing: false,
        dateAdded: new Date(),
        coverUrl: comic.coverUrl
      });
      
      toast({
        title: "BD ajoutée",
        description: `${comic.title} a été ajouté à votre bibliothèque`,
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la BD:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la BD à votre bibliothèque",
        variant: "destructive",
      });
    }
  };

  // Grouper et trier les comics
  const groupedComics = comics.reduce((acc: SeriesGroup, comic) => {
    const series = comic.series || 'Autres';
    if (!acc[series]) {
      acc[series] = [];
    }
    if (!acc[series].some(c => c.id === comic.id)) {
      acc[series].push(comic);
    }
    return acc;
  }, {});

  // Trier les séries
  const sortedSeries = Object.keys(groupedComics).sort((a, b) => 
    a.localeCompare(b, 'fr', { ignorePunctuation: true })
  );

  // Ajouter les tomes manquants et trier
  sortedSeries.forEach(series => {
    if (series !== 'Autres') {
      const volumes = groupedComics[series]
        .map(c => c.volume)
        .filter(v => v !== undefined)
        .map(v => parseInt(v!.toString()));
      
      if (volumes.length > 0) {
        const maxVol = Math.max(...volumes);
        const firstComic = groupedComics[series][0];
        
        for (let i = 1; i <= maxVol; i++) {
          if (!volumes.includes(i)) {
            groupedComics[series].push({
              id: `missing-${series}-${i}`,
              title: `${series} - Tome ${i}`,
              series,
              volume: i,
              author: firstComic.author,
              coverUrl: '/placeholder.svg',
              missing: true
            });
          }
        }
        
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
      <FilterSection
        showMissingOnly={showMissingOnly}
        onShowMissingChange={setShowMissingOnly}
        onLetterClick={scrollToLetter}
      />
      
      <div className="mt-4 space-y-8">
        {sortedSeries.map((series) => (
          <SeriesSection
            key={series}
            series={series}
            comics={groupedComics[series]}
            onAddMissing={handleAddMissing}
            showMissingOnly={showMissingOnly}
          />
        ))}
      </div>
    </div>
  );
}