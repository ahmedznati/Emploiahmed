
import { AppProvider } from "@/context/AppProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import PublicTimetable from "./pages/PublicTimetable";
import { Header } from "./components/Header";
import { PageNavigator } from "./components/PageNavigator";
import { useApp } from "./context/useApp";
import { useTranslation } from "./hooks/useTranslation";
import { TeacherManagement } from './components/TeacherManagement';
const queryClient = new QueryClient();

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { state } = useApp();
  const { t } = useTranslation();
  const isRTL = state.language === 'ar';
  
  return (
    <div className={`min-h-screen flex flex-col bg-gray-lightest ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <PageNavigator />
      <footer className="bg-white border-t border-gray-light p-4 text-center text-sm text-muted-foreground">
        <p>{t("copyright")}</p>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/teachers" element={<TeacherManagement />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/index" element={<Index />} />
              <Route path="/timetable" element={<PublicTimetable />} />
              <Route path="/admin" element={
                <LayoutWrapper>
                  <AdminPanel />
                </LayoutWrapper>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
