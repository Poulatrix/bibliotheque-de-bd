import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Comic } from '@/lib/types';

interface ComicFormProps {
  formData: {
    title: string;
    series: string;
    volume: string;
    author: string;
    year: string;
    coverUrl: string;
  };
  onFormChange: (field: string, value: string) => void;
  onSearchCover: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ComicForm({ formData, onFormChange, onSearchCover, onSubmit }: ComicFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => onFormChange('title', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="series">Série</Label>
        <Input
          id="series"
          value={formData.series}
          onChange={(e) => onFormChange('series', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="volume">Tome</Label>
        <Input
          id="volume"
          type="number"
          value={formData.volume}
          onChange={(e) => onFormChange('volume', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Auteur *</Label>
        <Input
          id="author"
          required
          value={formData.author}
          onChange={(e) => onFormChange('author', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="year">Année</Label>
        <Input
          id="year"
          type="number"
          value={formData.year}
          onChange={(e) => onFormChange('year', e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="coverUrl">URL de la couverture</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSearchCover}
          >
            <Search className="h-4 w-4 mr-2" />
            Rechercher une couverture
          </Button>
        </div>
        <Input
          id="coverUrl"
          type="url"
          value={formData.coverUrl}
          onChange={(e) => onFormChange('coverUrl', e.target.value)}
          placeholder="https://"
        />
      </div>
      <Button type="submit" className="w-full bg-library-accent hover:bg-library-accent/90">
        Ajouter
      </Button>
    </form>
  );
}