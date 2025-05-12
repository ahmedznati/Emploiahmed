
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileDown } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface TimetableControlsProps {
  selectedClass: string;
  selectedWeek: number;
  classes: { id: string; name: string }[];
  availableWeeks: number[];
  onClassChange: (value: string) => void;
  onWeekChange: (value: string) => void;
  onDownloadPDF: () => void;
}

export const TimetableControls = ({
  selectedClass,
  selectedWeek,
  classes,
  availableWeeks,
  onClassChange,
  onWeekChange,
  onDownloadPDF
}: TimetableControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Emploi du Temps Scolaire</h2>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="class-filter" className="text-gray-800 font-medium">Classe:</Label>
          <Select 
            value={selectedClass} 
            onValueChange={onClassChange}
          >
            <SelectTrigger className="w-40 md:w-48">
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Classes</SelectLabel>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.name}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {availableWeeks.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="week-filter" className="text-gray-800 font-medium">Semaine:</Label>
            <Select 
              value={selectedWeek.toString()} 
              onValueChange={onWeekChange}
            >
              <SelectTrigger className="w-40 md:w-48">
                <SelectValue placeholder="Sélectionner une semaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Semaines</SelectLabel>
                  {availableWeeks.map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Semaine {week}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 sm:mt-0" 
          onClick={onDownloadPDF}
        >
          <FileDown className="mr-2 h-4 w-4" /> 
          Télécharger PDF
        </Button>
      </div>
    </div>
  );
};
