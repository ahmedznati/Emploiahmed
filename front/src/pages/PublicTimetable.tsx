
import { useApp } from "@/context/useApp";
import { Timetable } from "@/components/Timetable";
import { PageNavigator } from "@/components/PageNavigator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const PublicTimetable = () => {
  const { state } = useApp();
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="relative bg-blue-dark py-16">
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: "url('/images/military-academy.jpg')", 
            backgroundSize: "cover", 
            backgroundPosition: "center",
            filter: "blur(2px)"
          }}>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t("militarySchoolTimetable")}</h1>
              <p className="text-blue-100 text-lg">{t("checkCurrentSchedule")}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-blue-dark text-xl">
              {t("courseSchedule")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Timetable 
              schedule={state.schedule} 
              teachers={state.teachers} 
              classes={state.classes}
            />
          </CardContent>
        </Card>
      </main>

      <div className="container mx-auto px-4 py-4">
        <PageNavigator />
      </div>
      
      <footer className="bg-blue-dark text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100">{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicTimetable;
