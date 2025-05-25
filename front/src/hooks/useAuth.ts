import { useState, useEffect } from "react";
import { UserRole } from "../types";
import { useToast } from "@/components/ui/use-toast";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const { toast } = useToast();
  
  // Initialize admin credentials from localStorage or default
  const [adminUsername, setAdminUsername] = useState(() => {
    return localStorage.getItem('adminUsername') || 'Academie2025';
  });
  
  const [adminPassword, setAdminPasswordState] = useState(() => {
    return localStorage.getItem('adminPassword') || 'admin2025';
  });

  // Save credentials to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('adminUsername', adminUsername);
    localStorage.setItem('adminPassword', adminPassword);
  }, [adminUsername, adminPassword]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        let errorMsg = "Login failed";
        try {
          const { error } = await response.json();
          // Show a user-friendly message for invalid credentials
          if (error === "Invalid credentials") {
            errorMsg = "Incorrect username or password";
          } else if (error) {
            errorMsg = error;
          }
        } catch { /* ignore JSON parse errors */ }
        throw new Error(errorMsg);
      }

      // Store JWT token in localStorage
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
      }

      setIsAuthenticated(true);
      setCurrentRole('admin');
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté en tant qu'administrateur."
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      toast({
        title: "Échec de la connexion",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('public');
    localStorage.removeItem('jwtToken');
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté du panneau d'administration."
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        toast({
          title: "Échec de modification",
          description: error || "Erreur lors du changement de mot de passe.",
          variant: "destructive"
        });
        return false;
      }
      setAdminPasswordState(newPassword);
      toast({
        title: "Mot de passe modifié",
        description: "Le mot de passe administrateur a été mis à jour avec succès."
      });
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      toast({
        title: "Échec de modification",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isAuthenticated,
    currentRole,
    login,
    logout,
    changePassword
  };
}
