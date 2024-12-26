import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Comic } from '@/lib/types';
import { PlusCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { searchByISBN, convertEANtoISBN, searchCoverImage } from '@/lib/googleBooks';

interface AddComicModalProps {
  onAddComic: (comic: Comic) => void;
}

export function AddComicModal({ onAddComic }: AddComicModalProps) {
  const [open, setOpen] = useState(false);
  const [isbn, setIsbn] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    series: '',
    volume: '',
    author: '',
    year: '',
    coverUrl: '',
  });

  const handleIsbnSearch = async () => {
    if (!isbn.trim()) return;
    
    try {
      // Essayer d'abord avec l'ISBN
      let results = await searchByISBN(isbn);
      
      // Si pas de résultat et que c'est un EAN (13 chiffres), convertir en ISBN-10
      if (results.length === 0 && isbn.length === 13 && /^\d+$/.test(isbn)) {
        const isbn10 = convertEANtoISBN(isbn);
        if (isbn10) {
          results = await searchByISBN(isbn10);
        }
      }

      if (results.length > 0) {
        const book = results[0];
        const titleParts = book.volumeInfo.title.split(' - ');
        const volumeMatch = book.volumeInfo.title.match(/(?:T|Tome|Vol\.?)\s*(\d+)/i);
        
        setFormData({
          title: book.volumeInfo.title,
          series: titleParts.length > 1 ? titleParts[0] : '',
          volume: volumeMatch ? volumeMatch[1] : '',
          author: book.volumeInfo.authors?.[0] || '',
          year: book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.substring(0, 4) : '',
          coverUrl: book.volumeInfo.imageLinks?.thumbnail || '',
        });
        toast.success("Informations trouvées !");
      } else {
        toast.error("Aucun résultat trouvé pour cet ISBN/EAN");
      }
    } catch (error) {
      console.error('Error searching by ISBN:', error);
      toast.error("Erreur lors de la recherche");
    }
  };

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
    setIsbn('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-library-accent hover:bg-library-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Ajouter une BD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-library-paper">
        <DialogHeader>
          <DialogTitle className="font-merriweather">Ajouter une nouvelle BD</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Rechercher par ISBN..."
              />
            </div>
            <Button
              type="button"
              onClick={handleIsbnSearch}
              className="mt-8"
              variant="outline"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
