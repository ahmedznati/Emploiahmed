
import { useApp } from "@/context/useApp";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { Globe, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { state, login, logout, toggleLanguage } = useApp();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setIsLoginDialogOpen(false);
      setUsername("");
      setPassword("");
      navigate("/admin");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLanguageChange = (lang: 'en' | 'ar' | 'fr') => {
    toggleLanguage(lang);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <header className="bg-blue-light p-4 text-white shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold mb-2 md:mb-0">
          {t("schoolScheduleManager")}
        </h1>
        
        <nav className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-blue-dark"
              >
                <Globe className="h-4 w-4 mr-2" />
                {t("changeLanguage")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('fr')}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            className="text-white hover:bg-blue-dark"
            onClick={() => navigate("/")}
          >
            {t("timetable")}
          </Button>
          
          {state.isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-blue-dark"
                onClick={() => navigate("/admin")}
              >
                {t("adminPanel")}
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white text-blue-light hover:bg-gray-100 hover:text-blue-dark"
                onClick={handleLogout}
              >
                {t("logout")}
              </Button>
            </>
          ) : (
            <Button 
              variant="secondary" 
              className="bg-white text-blue-light hover:bg-gray-100 hover:text-blue-dark"
              onClick={() => setIsLoginDialogOpen(true)}
            >
              {t("adminLogin")}
            </Button>
          )}
        </nav>
      </div>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("adminLogin")}</DialogTitle>
            <DialogDescription>
              {t("enterAdminCredentials")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input 
                id="username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("enterUsername")}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enterPassword")}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsLoginDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("login")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
