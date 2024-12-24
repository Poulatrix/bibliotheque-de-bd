import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Comic } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddComicModalProps {
  onAddComic: (comic: Comic) => void;
}

export function AddComicModal({ onAddComic }: AddComicModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    series: '',
    volume: '',
    author: '',
    year: '',
    coverUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comic: Comic = {
      id: Date.now().toString(),
      title: formData.title,
      series: formData.series || undefined,
      volume: formData.volume ? parseInt(formData.volume) : undefined,
      author: formData.author,
      year: formData.year ? parseInt(formData.year) : undefined,
      coverUrl: formData.coverUrl || '/placeholder.svg',
    };
    onAddComic(comic);
    setOpen(false);
    toast.success("BD ajoutée avec succès!");
    setFormData({
      title: '',
      series: '',
      volume: '',
      author: '',
      year: '',
      coverUrl: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-library-accent hover:bg-library-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une BD
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-merriweather">Ajouter une nouvelle BD</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="series">Série</Label>
            <Input
              id="series"
              value={formData.series}
              onChange={(e) => setFormData({ ...formData, series: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="volume">Tome</Label>
            <Input
              id="volume"
              type="number"
              value={formData.volume}
              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Auteur *</Label>
            <Input
              id="author"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Année</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverUrl">URL de la couverture</Label>
            <Input
              id="coverUrl"
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://"
            />
          </div>
          <Button type="submit" className="w-full bg-library-accent hover:bg-library-accent/90">
            Ajouter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}