import { useToast } from "@/components/ui/use-toast";
import { Teacher } from "../types";

export function useTeacherManagement(
  initialTeachers: Teacher[],
  setTeachers: (teachers: Teacher[] | ((prev: Teacher[]) => Teacher[])) => void
) {
  console.log('useTeacherManagement initialized:', {
    initialTeachersLength: initialTeachers.length,
    setTeachersType: typeof setTeachers,
    setTeachers: setTeachers
  });

  const { toast } = useToast();

  const addTeacher = async (teacher: Teacher) => {
    try {
      console.log('addTeacher called with teacher:', teacher);
      const response = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add teacher');
      }

      const { id: backendId } = await response.json();
      const newTeacher = { ...teacher, id: backendId };

      console.log('Before calling setTeachers:', { newTeacher, setTeachersType: typeof setTeachers });
      // Remove any temporary id (like teacher-...) from state
      setTeachers((prev: Teacher[]) => [
        ...prev.filter(t => t.id !== teacher.id),
        newTeacher
      ]);

      toast({
        title: "Teacher added",
        description: `${newTeacher.name} has been added to the system.`,
        variant: "default",
      });

      return newTeacher;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error adding teacher:", error);
      toast({
        title: "Error adding teacher",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const updateTeacher = async (teacher: Teacher) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${teacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacher),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update teacher');
      }

      setTeachers((prev: Teacher[]) => prev.map(t => (t.id === teacher.id ? teacher : t)));
      toast({
        title: "Teacher updated",
        description: `${teacher.name} has been updated.`,
        variant: "default",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error updating teacher:", error);
      toast({
        title: "Error updating teacher",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Teacher not found",
            description: `The teacher was already deleted or does not exist in the database.`,
            variant: "destructive",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete teacher');
        }
      } else {
        setTeachers((prev: Teacher[]) => prev.filter(t => t.id !== id));
        toast({
          title: "Teacher deleted",
          description: `The teacher has been removed from the system.`,
          variant: "default",
        });
      }
      // Always refresh teachers from backend after delete
      try {
        const fetchResponse = await fetch('http://localhost:5000/api/teachers');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setTeachers(data.map((t: { _id: string; name: string; subjects: string[]; availability: Record<string, unknown> }) => ({ ...t, id: t._id })));
        }
      } catch (fetchError) {
        console.error('Error refreshing teachers after delete:', fetchError);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error deleting teacher",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return { addTeacher, updateTeacher, deleteTeacher };
}
