import { useState, useEffect } from 'react';
import { Class, SubjectRequirement, DEFAULT_CLASS_NAMES } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from '@/context/useApp';
import { getAllSubjects, addCustomSubject } from '@/utils/subjectsData';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

interface ClassFormProps {
  cls?: Class;
  onSubmit: (cls: Class | Class[]) => void;
  onCancel: () => void;
}

export function ClassForm({ cls, onSubmit, onCancel }: ClassFormProps) {
  const { state } = useApp();

  // Default to 0 weeks if scheduleSettings is undefined
  const numberOfWeeks = state?.scheduleSettings?.numberOfWeeks || 0;

  const { t } = useTranslation();
  const [name, setName] = useState(cls?.name || '');
  const [customClassName, setCustomClassName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [hoursInput, setHoursInput] = useState('1');
  const [requirements, setRequirements] = useState<SubjectRequirement[]>(
    cls?.subjectRequirements || []
  );
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [classNameOpen, setClassNameOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>(cls ? 'edit' : 'add');

  console.log('ClassForm initialized with mode:', mode, 'and cls:', cls);

  const id = cls?.id || `class-${Date.now()}`;

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/subjects`);
        if (Array.isArray(response.data)) {
          const subjectNames = response.data.map((subject: { name: string }) => subject.name);
          setAvailableSubjects(subjectNames);
        } else {
          console.error('Unexpected response format:', response.data);
          setAvailableSubjects([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setAvailableSubjects([]); // Fallback to an empty array
      }
    }
    fetchSubjects();
  }, []);

  const handleAddRequirement = () => {
    if (
      selectedSubject &&
      !requirements.some(req => req.subject === selectedSubject)
    ) {
      const hours = parseInt(hoursInput);
      if (isNaN(hours) || hours < 1) return;

      setRequirements([
        ...requirements,
        {
          subject: selectedSubject,
          hoursPerWeek: hours,
        },
      ]);
      setSelectedSubject('');
      setHoursInput('1');
    }
  };

  const handleAddCustomSubject = async () => {
    if (
      newSubject.trim() &&
      !requirements.some(req => req.subject === newSubject.trim())
    ) {
      const hours = parseInt(hoursInput);
      if (isNaN(hours) || hours < 1) return;

      await addCustomSubject(newSubject.trim());
      const updatedSubjects = await getAllSubjects();
      setAvailableSubjects(updatedSubjects);
      setRequirements([
        ...requirements,
        {
          subject: newSubject.trim(),
          hoursPerWeek: hours,
        },
      ]);
      setNewSubject('');
      setHoursInput('1');
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubject.trim()) {
      alert('Subject name cannot be empty.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/subjects`, { name: newSubject });
      const createdSubject = response.data.subject;

      // Add the new subject to the dropdown options
      setAvailableSubjects((prev) => [...prev, createdSubject.name]);
      setNewSubject(''); // Clear the input field
      alert('Subject created successfully!');
    } catch (error) {
      console.error('Error creating subject:', error);
      alert('Failed to create subject. Please try again.');
    }
  };

  const handleCreateAndAddSubject = async () => {
    await handleCreateSubject();
    await handleAddCustomSubject();
  };

  const handleRemoveRequirement = (subject: string) => {
    setRequirements(requirements.filter(req => req.subject !== subject));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || requirements.length === 0) return;

    // Fallback check to ensure correct request is triggered
    if (!cls && mode === 'edit') {
      console.error('Edit mode triggered without a valid class object');
      return;
    }

    // Ensure subjectRequirements is sent as a list
    const classData = {
      id,
      name,
      subjectRequirements: requirements.map(req => ({
        subject: req.subject,
        hoursPerWeek: req.hoursPerWeek,
      })),
    };

    try {
      if (mode === 'add') {
        await axios.post(`${API_BASE_URL}/api/classes`, classData);
      } else {
        await axios.put(`${API_BASE_URL}/api/classes/${id}`, classData);
      }

      // Notify the parent component to refresh the classes list
      if (typeof onSubmit === 'function') {
        onSubmit(classData);
      }

      // Clear the form fields after submission
      setName('');
      setRequirements([]);
      setSelectedSubject('');
      setHoursInput('1');
    } catch (err) {
      console.error('Error submitting class:', err);
    }
  };

  const handleClassNameSelect = (value: string) => {
    setName(value);
    setClassNameOpen(false);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{mode === 'edit' ? t('editClass') : t('addNewClass')}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('className')}</Label>
            <div className="flex gap-2">
              <Popover open={classNameOpen} onOpenChange={setClassNameOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={classNameOpen}
                    className="w-full justify-between"
                  >
                    {name ? t(name) : t('selectClassName')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t('selectClassName')} />
                    <CommandEmpty>{t('noClassNameFound')}</CommandEmpty>
                    <CommandGroup>
                      {DEFAULT_CLASS_NAMES.map((className) => (
                        <CommandItem
                          key={className}
                          value={className}
                          onSelect={handleClassNameSelect}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              name === className ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {t(className)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <div className="flex items-center border-t px-3 py-2">
                      <Input
                        value={customClassName}
                        onChange={(e) => setCustomClassName(e.target.value)}
                        placeholder={t('addCustomClassName')}
                        className="flex-1 mr-2"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => {
                          if (customClassName.trim()) {
                            handleClassNameSelect(customClassName.trim());
                            setCustomClassName('');
                          }
                        }}
                      >
                        {t('add')}
                      </Button>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t('subjectRequirements')}</Label>
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
              <Input 
                type="number" 
                min="1" 
                max="20"
                value={hoursInput} 
                onChange={(e) => setHoursInput(e.target.value)}
                className="w-20"
              />
              <Label className="self-center whitespace-nowrap">{t('hours')}</Label>
              <Button 
                type="button" 
                onClick={handleAddRequirement}
                variant="outline"
              >
                {t('add')}
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              <Input 
                value={newSubject} 
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder={t('addCustomSubject')}
                className="flex-1"
              />
              <Input 
                type="number" 
                min="1" 
                max="20"
                value={hoursInput} 
                onChange={(e) => setHoursInput(e.target.value)}
                className="w-20"
              />
              <Label className="self-center whitespace-nowrap">{t('hours')}</Label>
              <Button 
                type="button" 
                onClick={handleCreateAndAddSubject}
                variant="outline"
              >
                {t('create')}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {t('totalHoursDistributed')} {numberOfWeeks} {t('weeks')}
            </p>
            
            {requirements.length > 0 ? (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-[1fr,auto,auto] gap-2 font-medium">
                  <div>{t('subject')}</div>
                  <div>{t('totalHours')}</div>
                  <div></div>
                </div>
                
                {requirements.map(req => (
                  <div 
                    key={req.subject}
                    className="grid grid-cols-[1fr,auto,auto] gap-2 items-center border-b border-gray-light pb-2"
                  >
                    <div>{t(req.subject)}</div>
                    <div className="text-center">{req.hoursPerWeek}</div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveRequirement(req.subject)}
                      className="h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                {t('noSubjectRequirements')}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            {t('cancel')}
          </Button>
          <Button 
            type="submit"
            disabled={!name || requirements.length === 0}
          >
            {mode === 'edit' ? t('saveChanges') : t('addClass')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
