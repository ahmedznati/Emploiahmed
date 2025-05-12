
import { Header } from "@/components/Header";
import PublicTimetable from "./PublicTimetable";
import { ImageCarousel } from "@/components/ImageCarousel";
import { PageNavigator } from "@/components/PageNavigator";
import { useTranslation } from "@/hooks/useTranslation";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-lightest">
      <Header />
      <main className="flex-1">
        <section className="py-8 bg-white border-b border-gray-light">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold text-blue-dark mb-4">
                {t("militarySchoolManagement")}
              </h1>
              <p className="text-gray">
                {t("welcomeMessage")}
              </p>
            </div>
          </div>
        </section>
        
        <ImageCarousel />
        
        <PublicTimetable />
      </main>
      
      <PageNavigator />
      
      <footer className="bg-white border-t border-gray-light p-4 text-center text-sm text-muted-foreground">
        <p>{t("copyright")}</p>
      </footer>
    </div>
  );
};

export default Index;
