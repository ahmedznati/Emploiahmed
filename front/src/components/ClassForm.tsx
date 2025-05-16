import { useState, useEffect } from 'react';
import { Class, SubjectRequirement, DEFAULT_CLASS_NAMES, Teacher } from '@/types';
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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSelections, setTeacherSelections] = useState<Record<string, string>>({}); // subject -> teacherId
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

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/teachers`);
        if (Array.isArray(response.data)) {
          setTeachers(response.data.map((t: any) => ({ ...t, id: t._id || t.id })));
        }
      } catch (error) {
        setTeachers([]);
      }
    }
    fetchTeachers();
  }, []);

  const handleAddRequirement = () => {
    if (
      selectedSubject &&
      !requirements.some(req => req.subject === selectedSubject)
    ) {
      const hours = parseInt(hoursInput);
      if (isNaN(hours) || hours < 1) return;
      const teacherId = teacherSelections[selectedSubject] || '';
      setRequirements([
        ...requirements,
        {
          subject: selectedSubject,
          hoursPerWeek: hours,
          teacherId,
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
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const handleCreateAndAddSubject = async () => {
    await handleCreateSubject();
    await handleAddCustomSubject();
  };

  const handleRemoveRequirement = (subject: string) => {
    setRequirements(requirements.filter(req => req.subject !== subject));
  };

  const handleEditRequirementTeacher = (subject: string, teacherId: string) => {
    setRequirements(reqs => reqs.map(req =>
      req.subject === subject ? { ...req, teacherId } : req
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || requirements.length === 0) return;

    // Fallback check to ensure correct request is triggered
    if (!cls && mode === 'edit') {
      console.error('Edit mode triggered without a valid class object');
      return;
    }

    const trimmedName = name.trim();

    const classData = {
      id,
      name: trimmedName, // Keep the original casing of the class name
      subjectRequirements: requirements.map(req => ({
        subject: req.subject,
        hoursPerWeek: req.hoursPerWeek,
        teacherId: req.teacherId || teacherSelections[req.subject] || '',
      })),
    };

    try {
      if (mode === 'add') {
        await axios.post(`${API_BASE_URL}/api/classes`, classData);
      } else {
        await axios.put(`${API_BASE_URL}/api/classes/${id}`, classData);
      }

      if (typeof onSubmit === 'function') {
        onSubmit(classData); // Update the parent component's state immediately
      }

      // Clear the form fields after successful submission
      setName('');
      setRequirements([]);
      setSelectedSubject('');
      setHoursInput('1');
    } catch (err) {
      console.error('Error submitting class:', err);
    }
  };

  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
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
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('enterClassName')}
              className="w-full"
            />
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
              {/* Teacher selection dropdown for the selected subject */}
              {selectedSubject && (
                <Select
                  value={teacherSelections[selectedSubject] || ''}
                  onValueChange={tid => setTeacherSelections(s => ({ ...s, [selectedSubject]: tid }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('selectTeacher')} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.filter(t => t.subjects.includes(selectedSubject)).map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                <div className="grid grid-cols-[1fr,auto,auto,auto] gap-2 font-medium">
                  <div>{t('subject')}</div>
                  <div>{t('totalHours')}</div>
                  <div>{t('teacher')}</div>
                  <div></div>
                </div>
                
                {requirements.map(req => (
                  <div 
                    key={req.subject}
                    className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center border-b border-gray-light pb-2"
                  >
                    <div>{t(req.subject)}</div>
                    <div className="text-center">{req.hoursPerWeek}</div>
                    <Select
                      value={req.teacherId || ''}
                      onValueChange={tid => handleEditRequirementTeacher(req.subject, tid)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder={t('selectTeacher')} />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.filter(t => t.subjects.includes(req.subject)).map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
