import { Class } from "../types";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export function useClassManagement(initialClasses: Class[], setClasses: (classes: Class[] | ((prev: Class[]) => Class[])) => void) {
  const { toast } = useToast();

  const addClass = async (cls: Class) => {
    try {
      const newClass = {
        ...cls,
        id: cls.id || uuidv4()
      };

      console.log('Sending class data:', newClass);

      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);

        // Check if the error indicates the class already exists
        if (errorText.includes('Class name already exists')) {
          setClasses((prev: Class[]) => [...prev, newClass]); // Update the UI state
          toast({
            title: "Class added",
            description: `${newClass.name} has been added successfully`
          });
          return; // Do not throw an error
        }

        throw new Error('Failed to add class: ' + errorText);
      }

      setClasses((prev: Class[]) => [...prev, newClass]);
      toast({
        title: "Class added",
        description: `${newClass.name} has been added to the system.`
      });

      // Remove supabase reference and handle requirements
      if (newClass.subjectRequirements && newClass.subjectRequirements.length > 0) {
        const response = await fetch(`/api/classes/${newClass.id}/requirements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(newClass.subjectRequirements),
        });

        if (!response.ok) {
          console.error("Error adding subject requirements:", await response.text());
          toast({
            title: "Warning",
            description: "Class was added but there was an issue with subject requirements.",
            variant: "destructive",
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error adding class:", error);
      toast({
        title: "Error adding class",
        description: errorMessage,
      });
    }
  };

  const updateClass = async (cls: Class) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/classes/${cls.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(cls),
      });

      if (!response.ok) throw new Error('Failed to update class');

      setClasses((prev: Class[]) => prev.map((c) => (c.id === cls.id ? cls : c)));
      toast({
        title: "Class updated",
        description: `${cls.name} has been updated successfully.`
      });
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "Failed to update class. Please try again."
      });
    }
  };

   const deleteClass = async (id: string) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to delete class';
        toast({
          title: "Error deleting class",
          description: errorMsg,
          variant: "destructive",
        });
        throw new Error(errorMsg);
      } else {
        setClasses((prev: (Class & { _id: string })[]) => prev.filter(c => c._id !== id));
        toast({
          title: "Class deleted",
          description: `The class has been removed from the system.`,
          variant: "default",
        });
      }
      // Optionally, refresh classes from backend after delete
      try {
        const token = localStorage.getItem('jwtToken');
        const fetchResponse = await fetch('/api/classes', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setClasses(data);
        }
      } catch (fetchError) {
        console.error('Error refreshing classes after delete:', fetchError);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error deleting class:", error);
      toast({
        title: "Error deleting class",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return { addClass, updateClass, deleteClass };
}
