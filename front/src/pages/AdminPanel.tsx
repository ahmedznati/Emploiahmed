import { useState } from "react";
import { useApp } from "@/context/useApp";
import { useNavigate } from "react-router-dom";
import { Teacher, Class, ScheduleSettings, TimeSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherForm } from "@/components/TeacherForm";
import { ClassForm } from "@/components/ClassForm";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminPanel = () => {
  const { state, login, addTeacher, updateTeacher, deleteTeacher, addClass, updateClass, deleteClass, generateNewSchedule, updateScheduleSettings, changePassword, toggleLanguage } = useApp();
  const [activeTab, setActiveTab] = useState("teachers");
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState<Teacher | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState<Class | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ type: 'teacher' | 'class', id: string } | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>(state.scheduleSettings);
  const [passwordChangeDialog, setPasswordChangeDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(!state.isAuthenticated);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleTeacherSubmit = (teacher: Teacher) => {
    if (isEditingTeacher) {
      updateTeacher(teacher);
      setIsEditingTeacher(null);
    } else {
      addTeacher(teacher);
      setIsAddingTeacher(false);
    }
  };
  
  const handleClassSubmit = (cls: Class) => {
    if (isEditingClass) {
      updateClass(cls);
      setIsEditingClass(null);
    } else {
      addClass(cls);
      setIsAddingClass(false);
    }
  };
  
  const confirmDelete = () => {
    if (!deleteConfirmDialog) return;
    
    if (deleteConfirmDialog.type === 'teacher') {
      deleteTeacher(deleteConfirmDialog.id);
    } else {
      deleteClass(deleteConfirmDialog.id);
    }
    
    setDeleteConfirmDialog(null);
  };
  
  const handleGenerateSchedule = () => {
    updateScheduleSettings(scheduleSettings);
    generateNewSchedule(); // Always use the latest value
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return; // Passwords don't match
    }
    
    const success = changePassword(currentPassword, newPassword);
    if (success) {
      setPasswordChangeDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Show login dialog if not authenticated and dialog is open
  if (!state.isAuthenticated && loginDialogOpen) {
    return (
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError("");
              const success = await login(loginUsername, loginPassword);
              if (!success) {
                setLoginError("Incorrect username or password");
                // Do NOT redirect or close dialog
              } else {
                setLoginDialogOpen(false);
              }
            }}
            className="space-y-4"
          >
            <Input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
            {loginError && <div className="text-red-500 text-sm">{loginError}</div>}
            <DialogFooter>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Login
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
  // If not authenticated and dialog is closed, show nothing (block access)
  if (!state.isAuthenticated && !loginDialogOpen) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-dark">Admin Panel</h1>
          <p className="text-muted-foreground">Manage teachers, classes, and generate schedules</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setPasswordChangeDialog(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Change Admin Password
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Teacher Management</h2>
            <Button onClick={() => setIsAddingTeacher(true)}>Add Teacher</Button>
          </div>
          
          {state.teachers && state.teachers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {state.teachers.map(teacher => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <CardTitle>{teacher.name}</CardTitle>
                    <CardDescription>
                      Subjects: {teacher.subjects.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Weekly Availability:</h4>
                    <div className="text-sm">
                      {Object.entries(teacher.availability).map(([day, slots]) => (
                        <div key={day} className="mb-1">
                          <span className="font-medium capitalize">{day}:</span>{' '}
                          {slots && Array.isArray(slots) && slots.length > 0 ? (
                            slots
                              .sort((a: TimeSlot, b: TimeSlot) => a.start.localeCompare(b.start))
                              .map((slot: TimeSlot, i: number) => (
                                <span key={i} className="mr-2">
                                  {slot.start === "08:00" && slot.end === "12:00" ? "Morning" : ""}
                                  {slot.start === "14:00" && slot.end === "18:00" ? "Afternoon" : ""}
                                  {(slot.start !== "08:00" || slot.end !== "12:00") && 
                                   (slot.start !== "14:00" || slot.end !== "18:00") ? 
                                    `${slot.start}-${slot.end}` : ""}
                                  {i < (Array.isArray(slots) ? slots.length : 0) - 1 ? ', ' : ''}
                                </span>
                              ))
                          ) : (
                            <span className="text-muted-foreground">Not available</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingTeacher(teacher)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => setDeleteConfirmDialog({ type: 'teacher', id: teacher.id })}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No teachers added yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setIsAddingTeacher(true)}
              >
                Add Your First Teacher
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Class Management</h2>
            <Button onClick={() => setIsAddingClass(true)}>Add Class</Button>
          </div>
          
          {state.classes.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {state.classes.map(cls => (
                <Card key={cls.id}>
                  <CardHeader>
                    <CardTitle>{cls.name}</CardTitle>
                    <CardDescription>
                      {cls.subjectRequirements.length} subject requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">Subject Requirements:</h4>
                    <div className="space-y-1">
                      {cls.subjectRequirements.map(req => (
                        <div key={req.subject} className="flex justify-between">
                          <span>{req.subject}</span>
                          <span>{req.hoursPerWeek} hours/week</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingClass(cls)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => setDeleteConfirmDialog({ type: 'class', id: cls.id })}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No classes added yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setIsAddingClass(true)}
              >
                Add Your First Class
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Schedule Generator</h2>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
              <CardDescription>
                Configure schedule generation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={scheduleSettings.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduleSettings({
                      ...scheduleSettings,
                      startDate: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numberOfWeeks">Number of Weeks</Label>
                  <Input 
                    id="numberOfWeeks" 
                    type="number" 
                    min={1}
                    max={52}
                    value={scheduleSettings.numberOfWeeks}
                    onChange={(e) => setScheduleSettings({
                      ...scheduleSettings,
                      numberOfWeeks: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="examScheduling"
                  checked={scheduleSettings.examSchedulingEnabled}
                  onCheckedChange={(checked) => setScheduleSettings({
                    ...scheduleSettings,
                    examSchedulingEnabled: checked
                  })}
                />
                <Label htmlFor="examScheduling">
                  Automatically schedule 2-hour exams at the end of the semester
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => toggleLanguage(state.language === 'en' ? 'fr' : state.language === 'fr' ? 'ar' : 'en')}
                >
                  Change to {state.language === 'en' ? 'Français' : state.language === 'fr' ? 'العربية' : 'English'}
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-2">Schedule Generation Logic</h3>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Subject hours will be distributed across the specified number of weeks</li>
                  <li>• Break times (9:50-10:10 and 15:50-16:10) will be automatically scheduled</li>
                  <li>• If exam scheduling is enabled, 2-hour exams will be added in the final week</li>
                  <li>• Teachers will be assigned based on availability and subject qualifications</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>
                View Current Timetable
              </Button>
              <Button onClick={handleGenerateSchedule}>
                Generate New Schedule
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Schedule</CardTitle>
              <CardDescription>
                {state.schedule.length} total class sessions scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium">Schedule Statistics:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-lightest p-4 rounded-lg text-center">
                    <p className="text-lg font-bold">{state.schedule.length}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="bg-gray-lightest p-4 rounded-lg text-center">
                    <p className="text-lg font-bold">{state.teachers.length}</p>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                  </div>
                  <div className="bg-gray-lightest p-4 rounded-lg text-center">
                    <p className="text-lg font-bold">{state.classes.length}</p>
                    <p className="text-sm text-muted-foreground">Classes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Teacher Forms */}
      {isAddingTeacher && (
        <TeacherForm 
          onSubmit={handleTeacherSubmit}
          onCancel={() => setIsAddingTeacher(false)}
        />
      )}
      
      {isEditingTeacher && (
        <TeacherForm 
          teacher={isEditingTeacher}
          onSubmit={handleTeacherSubmit}
          onCancel={() => setIsEditingTeacher(null)}
        />
      )}
      
      {/* Class Forms */}
      {isAddingClass && (
        <ClassForm 
          onSubmit={handleClassSubmit}
          onCancel={() => setIsAddingClass(false)}
        />
      )}
      
      {isEditingClass && (
        <>
          {console.log('Rendering ClassForm with cls:', isEditingClass)}
          <ClassForm 
            cls={isEditingClass}
            onSubmit={handleClassSubmit}
            onCancel={() => setIsEditingClass(null)}
          />
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmDialog} onOpenChange={() => setDeleteConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteConfirmDialog?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordChangeDialog} onOpenChange={setPasswordChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your admin credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {newPassword !== confirmPassword && newPassword && confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setPasswordChangeDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
