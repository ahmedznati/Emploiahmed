import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PageNavigator } from "@/components/PageNavigator";
import { useTranslation } from "@/hooks/useTranslation";
import { useApp } from "@/context/useApp";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Smartphone } from "lucide-react";

const HomePage = () => {
  const { t } = useTranslation();
  const { state } = useApp();
  const isRTL = state.language === 'ar';
  const { toast } = useToast();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const connectionChecked = useRef(false);
  
  // Check backend connection on page load
  useEffect(() => {
    // Prevent checking multiple times and showing duplicate toasts
    if (connectionChecked.current) return;
    
    const checkBackendConnection = async () => {
      try {
        connectionChecked.current = true; // Set flag to prevent multiple checks

        // Simple test to fetch teachers from the backend API
        const response = await fetch('http://localhost:5000/api/teachers', {
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          setBackendStatus('connected');
          toast({
            title: t("backendConnected"),
            description: t("backendConnectionSuccessful"),
            variant: "default",
          });
        } else {
          throw new Error('Backend API returned an error');
        }
      } catch (error) {
        console.error("Backend connection error:", error);
        setBackendStatus('error');
        toast({
          title: t("backendError"),
          description: t("backendConnectionFailed"),
          variant: "destructive",
        });
      }
    };

    checkBackendConnection();
  }, [toast, t]);
  
  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <div className="flex flex-1">
        {/* Main Content */}
        <main 
          className="flex-1 flex flex-col items-center justify-center p-8"
          style={{
            backgroundImage: `url("/lovable-uploads/b5d8c615-99a0-4eab-934e-a6cd977256a0.png")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(0,0,0,0.65)',
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="max-w-3xl w-full bg-white/90 p-8 rounded-lg shadow-lg backdrop-blur-sm">
            <h1 className="text-4xl font-bold text-blue-dark mb-6 text-center">
              {t("militarySchoolManagement")}
            </h1>
            
            <p className="text-lg text-gray-800 mb-8 text-center">
              {t("welcomeMessage")}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/timetable" className="w-full">
                <Button className="w-full text-lg py-6" size="lg">{t("viewTimetable")}</Button>
              </Link>
              <Link to="/admin" className="w-full">
                <Button className="w-full text-lg py-6" variant="outline" size="lg">{t("adminPanel")}</Button>
              </Link>
            </div>
            
            {backendStatus === 'checking' && (
              <div className="mt-6 text-center text-gray-600">
                <p>{t("checkingBackendConnection")}</p>
              </div>
            )}
            
            {backendStatus === 'error' && (
              <div className="mt-6 text-center text-red-600">
                <p>{t("backendConnectionError")}</p>
                <p className="text-sm mt-1">{t("ensureBackendRunning")}</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <PageNavigator />
      
      <footer className="bg-white border-t border-gray-light p-4 text-center text-sm text-muted-foreground">
        <p>{t("copyright")}</p>
      </footer>
    </div>
  );
};

export default HomePage;
