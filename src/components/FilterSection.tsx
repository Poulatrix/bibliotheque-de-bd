import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlphabetNav } from './AlphabetNav';

interface FilterSectionProps {
  showMissingOnly: boolean;
  onShowMissingChange: (value: boolean) => void;
  onLetterClick: (letter: string) => void;
}

export function FilterSection({ 
  showMissingOnly, 
  onShowMissingChange, 
  onLetterClick 
}: FilterSectionProps) {
  return (
    <div className="sticky top-[72px] z-40 bg-library-background py-4 shadow-md">
      <AlphabetNav onLetterClick={onLetterClick} />
      <div className="flex items-center justify-end gap-2 mb-4 px-4">
        <Switch
          id="missing-only"
          checked={showMissingOnly}
          onCheckedChange={onShowMissingChange}
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-library-accent"
        />
        <Label htmlFor="missing-only" className="text-library-text">
          Afficher uniquement les tomes manquants
        </Label>
      </div>
    </div>
  );
}