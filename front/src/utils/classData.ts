import { useEffect, useState } from 'react';

export const getAllClassNames = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/classes/names');
    if (!response.ok) {
      throw new Error('Failed to fetch class names');
    }
    const classes = await response.json();
    return classes.map((cls: { name: string }) => cls.name);
  } catch (error) {
    console.error('Error fetching class names:', error);
    return [];
  }
};

export const useClassNames = (): [string[], boolean] => {
  const [classNames, setClassNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClassNames = async () => {
      const fetchedClassNames = await getAllClassNames();
      setClassNames(fetchedClassNames);
      setLoading(false);
    };

    fetchClassNames();
  }, []);

  return [classNames, loading];
};