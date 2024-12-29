import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface IsbnSearchFieldProps {
  isbn: string;
  onIsbnChange: (value: string) => void;
  onSearch: () => void;
}

export function IsbnSearchField({ isbn, onIsbnChange, onSearch }: IsbnSearchFieldProps) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor="isbn">ISBN/EAN</Label>
        <Input
          id="isbn"
          value={isbn}
          onChange={(e) => onIsbnChange(e.target.value)}
          placeholder="Rechercher par ISBN ou EAN..."
        />
      </div>
      <Button
        type="button"
        onClick={onSearch}
        className="mt-8"
        variant="outline"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}