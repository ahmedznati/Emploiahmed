import { useState, useEffect } from "react";
import { Teacher, Class, AppState } from "../types";
import { useToast } from "@/components/ui/use-toast";

export function useDataLoader(initialState: Pick<AppState, "teachers" | "classes">) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialState.teachers);
  const [classes, setClasses] = useState<Class[]>(initialState.classes);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersResponse, classesResponse] = await Promise.all([
          fetch('/api/teachers'),
          fetch('/api/classes'),
        ]);

        if (!teachersResponse.ok || !classesResponse.ok) {
          throw new Error('Failed to load data from the backend');
        }

        const teachersRaw = await teachersResponse.json();
        const loadedTeachers: Teacher[] = teachersRaw.map((t: { _id: string; name: string; subjects: string[]; availability: Record<string, unknown> }) => ({ ...t, id: t._id }));
        const loadedClasses: Class[] = await classesResponse.json();

        setTeachers(loadedTeachers);
        setClasses(loadedClasses);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: errorMessage,
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  return { teachers, classes, setTeachers, setClasses };
}
