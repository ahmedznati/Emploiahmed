import { useEffect, useState } from 'react';

// Default subjects for the dropdown menu
export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "English",
  "Arabic",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music"
];

// Store and manage custom subjects
export const getStoredSubjects = (): string[] => {
  const storedSubjects = localStorage.getItem('customSubjects');
  return storedSubjects ? JSON.parse(storedSubjects) : [];
};

export const getAllSubjects = async (): Promise<string[]> => {
  try {
    const response = await fetch('http://localhost:5000/api/subjects');
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
    const subjects = await response.json();
    return subjects.map((subject: { name: string }) => subject.name);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const useSubjects = (): [string[], boolean] => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const fetchedSubjects = await getAllSubjects();
      setSubjects(fetchedSubjects);
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  return [subjects, loading];
};

export const addCustomSubject = (subject: string): void => {
  if (!subject.trim()) return;
  
  const customSubjects = getStoredSubjects();
  if (!customSubjects.includes(subject.trim()) && !DEFAULT_SUBJECTS.includes(subject.trim())) {
    customSubjects.push(subject.trim());
    localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
  }
};
