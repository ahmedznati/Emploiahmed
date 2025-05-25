import { useState, useEffect } from 'react';
import { TeacherForm } from './TeacherForm';
import { useTeacherManagement } from '../hooks/useTeacherManagement';
import { Teacher } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  console.log('TeacherManagement: setTeachers type:', typeof setTeachers, setTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { addTeacher, updateTeacher, deleteTeacher } = useTeacherManagement(teachers, setTeachers);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        if (response.ok) {
          const data = await response.json();
          setTeachers(data.map((t: { _id: string; name: string; subjects: string[]; availability: Record<string, unknown> }) => ({ ...t, id: t._id })));
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = (teacher: Teacher) => {
    const isDuplicate = teachers.some(t => t.name.trim().toLowerCase() === teacher.name.trim().toLowerCase() && t.id !== teacher.id);
    if (isDuplicate) {
      alert('teacher already existant');
      return;
    }
    if (teacher.id.startsWith('teacher-')) {
      addTeacher(teacher);
    } else {
      updateTeacher(teacher);
    }
    setSelectedTeacher(undefined);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleCancel = () => {
    setSelectedTeacher(undefined);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteTeacher(id);
    setDeletingId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teacher Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}</CardTitle>
          </CardHeader>
          <CardContent>
            <TeacherForm
              teacher={selectedTeacher}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <p>No teachers found.</p>
            ) : (
              <ul className="space-y-2">
                {teachers.map(teacher => (
                  <li key={teacher.id} className="flex justify-between items-center">
                    <span>{teacher.name} ({teacher.subjects.join(', ')})</span>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(teacher)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(teacher.id)}
                        disabled={deletingId === teacher.id}
                      >
                        {deletingId === teacher.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
