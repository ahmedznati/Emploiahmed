
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "Error 404: User attempted to access a nonexistent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-blue-light">404</h1>
        <p className="text-xl text-gray-dark mb-6">{t("pageNotFound")}</p>
        <Button onClick={() => navigate("/")}>
          {t("backToHome")}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
