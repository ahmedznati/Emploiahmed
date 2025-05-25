import { useState, useEffect } from 'react';
import { Teacher, WeeklyAvailability } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TIME_SLOTS, DAYS_OF_WEEK, DAY_LABELS, DAY_LABELS_FR } from '@/utils/timeConstants';
import { createEmptyTimeSlots } from '@/utils/availabilityUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/ui/use-toast';

interface TeacherFormProps {
  teacher?: Teacher;
  onSubmit: (teacher: Teacher) => void;
  onCancel: () => void;
}

const MORNING_SLOT = { start: "08:00", end: "12:00" };
const AFTERNOON_SLOT = { start: "14:00", end: "18:00" };

export function TeacherForm({ teacher, onSubmit, onCancel }: TeacherFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState(teacher?.name || '');
  const [newSubject, setNewSubject] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>(teacher?.subjects || []);
  const [availability, setAvailability] = useState<WeeklyAvailability>(
    teacher?.availability || createEmptyTimeSlots()
  );
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState<keyof WeeklyAvailability>('monday');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; subjects?: string }>({});
  const id = teacher?.id || `teacher-${Date.now()}`;

  useEffect(() => {
    console.log('TeacherForm initialized:', {
      teacher,
      onSubmitType: typeof onSubmit,
      onCancelType: typeof onCancel,
    });
  }, [teacher, onSubmit, onCancel]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setAvailableSubjects(data.map((subject: { name: string }) => subject.name));
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch subjects',
          variant: 'destructive',
        });
      }
    };
    fetchSubjects();
  }, [toast]);

  const hasTimeSlot = (day: keyof WeeklyAvailability, slot: typeof MORNING_SLOT | typeof AFTERNOON_SLOT) => {
    return availability[day].some(
      existingSlot => existingSlot.start === slot.start && existingSlot.end === slot.end
    );
  };

  const handleAddSubject = () => {
    if (selectedSubject && !subjects.includes(selectedSubject)) {
      setSubjects([...subjects, selectedSubject]);
      setSelectedSubject('');
      setErrors(prev => ({ ...prev, subjects: undefined }));
    }
  };

  const handleAddCustomSubject = async () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      try {
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newSubject.trim() }),
        });

        if (response.ok) {
          const addedSubject = await response.json();
          setSubjects([...subjects, addedSubject.subject.name]);
          setAvailableSubjects([...availableSubjects, addedSubject.subject.name]);
          setNewSubject('');
          setErrors(prev => ({ ...prev, subjects: undefined }));
        } else {
          toast({
            title: 'Error',
            description: 'Failed to add subject',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error adding subject:', error);
        toast({
          title: 'Error',
          description: 'Failed to add subject',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRemoveSubject = (subject: string) => {
    const newSubjects = subjects.filter(s => s !== subject);
    setSubjects(newSubjects);
    if (newSubjects.length === 0) {
      setErrors(prev => ({ ...prev, subjects: t('atLeastOneSubjectRequired') }));
    }
  };

  const toggleTimeSlot = (day: keyof WeeklyAvailability, slot: typeof MORNING_SLOT | typeof AFTERNOON_SLOT) => {
    const hasSlot = hasTimeSlot(day, slot);
    setAvailability({
      ...availability,
      [day]: hasSlot
        ? availability[day].filter(
            existingSlot => !(existingSlot.start === slot.start && existingSlot.end === slot.end)
          )
        : [...availability[day], { ...slot }],
    });
  };

  const toggleAllSlotsForDay = (day: keyof WeeklyAvailability) => {
    const hasMorning = hasTimeSlot(day, MORNING_SLOT);
    const hasAfternoon = hasTimeSlot(day, AFTERNOON_SLOT);
    setAvailability({
      ...availability,
      [day]: hasMorning && hasAfternoon ? [] : [{ ...MORNING_SLOT }, { ...AFTERNOON_SLOT }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; subjects?: string } = {};
    if (!name) newErrors.name = t('nameRequired');
    if (subjects.length === 0) newErrors.subjects = t('atLeastOneSubjectRequired');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    onSubmit({ id, name, subjects, availability });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{teacher ? t('editTeacher') : t('addNewTeacher')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('teacherName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterTeacherName')}
              required
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t('subjects')}</Label>
            <div className="flex gap-2">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectSubject')} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {t(subject)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddSubject} variant="outline">
                {t('add')}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder={t('addCustomSubject')}
              />
              <Button type="button" onClick={handleAddCustomSubject} variant="outline">
                {t('create')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {subjects.map(subject => (
                <div
                  key={subject}
                  className="bg-blue-light text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {t(subject)}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-white hover:text-gray-light"
                  >
                    ×
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('noSubjectsAdded')}</p>
              )}
            </div>
            {errors.subjects && <p className="text-sm text-red-500">{errors.subjects}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t('availability')}</Label>
            <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  {t('manageWeeklyAvailability')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]" aria-describedby="dialog-description">
                <DialogHeader>
                  <DialogTitle>{t('teacherAvailability')}</DialogTitle>
                  <DialogDescription id="dialog-description">
                    {t('setWeeklyAvailability')}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex space-x-2 mb-4 flex-wrap">
                    {DAYS_OF_WEEK.map(day => (
                      <Button
                        key={day}
                        type="button"
                        variant={currentDay === day ? "default" : "outline"}
                        onClick={() => setCurrentDay(day as keyof WeeklyAvailability)}
                        className="flex-1"
                      >
                        {t(day)}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        {t(currentDay)} {t('availability')}:
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAllSlotsForDay(currentDay)}
                      >
                        {hasTimeSlot(currentDay, MORNING_SLOT) && hasTimeSlot(currentDay, AFTERNOON_SLOT)
                          ? t('deselectAll')
                          : t('selectAll')}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${currentDay}-morning`}
                          checked={hasTimeSlot(currentDay, MORNING_SLOT)}
                          onCheckedChange={() => toggleTimeSlot(currentDay, MORNING_SLOT)}
                        />
                        <Label htmlFor={`${currentDay}-morning`}>{t('morningHours')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${currentDay}-afternoon`}
                          checked={hasTimeSlot(currentDay, AFTERNOON_SLOT)}
                          onCheckedChange={() => toggleTimeSlot(currentDay, AFTERNOON_SLOT)}
                        />
                        <Label htmlFor={`${currentDay}-afternoon`}>{t('afternoonHours')}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="mt-2 text-sm">
              {DAYS_OF_WEEK.map(day => {
                const dayType = day as keyof WeeklyAvailability;
                const dayAvailability = availability[dayType];
                const hasMorning = hasTimeSlot(dayType, MORNING_SLOT);
                const hasAfternoon = hasTimeSlot(dayType, AFTERNOON_SLOT);
                return (
                  <div key={day} className="mb-1">
                    <span className="font-medium">{t(day)}:</span>{' '}
                    {dayAvailability.length > 0 ? (
                      <span>
                        {hasMorning && t('morning')}
                        {hasMorning && hasAfternoon && ", "}
                        {hasAfternoon && t('afternoon')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{t('notAvailable')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={!name || subjects.length === 0}>
            {teacher ? t('saveChanges') : t('addTeacher')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}