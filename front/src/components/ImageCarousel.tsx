import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, School, Award, Shield, Flag } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const images = [
  {
    src: "/images/Military Academy.jpg",
    alt: "Military Academy",
    caption: "Military Leadership Training",
    icon: Award
  },
  {
    src: "/images/School Campus.jpg",
    alt: "School Campus",
    caption: "Modern School Facilities",
    icon: School
  },
  {
    src: "/images/Cadets in Training.jpg",
    alt: "Cadets in Training",
    caption: "Discipline and Excellence",
    icon: Flag
  },
  {
    src: "/images/Graduation Ceremony.jpg",
    alt: "Graduation Ceremony",
    caption: "Celebrating Achievement",
    icon: GraduationCap
  },
  {
    src: "/images/Military School Parade.jpg",
    alt: "Military School Parade",
    caption: "Honor and Tradition",
    icon: Shield
  }
];

export function ImageCarousel() {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-center mb-6">{t("ourInstitution")}</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => {
            const Icon = image.icon;
            return (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-center p-6">
                      <div className="h-[200px] w-full relative overflow-hidden rounded-md mb-4">
                        <img
                          src={image.src}
                          alt={t(image.alt)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // If image fails to load, show the fallback icon
                            const fallbackDiv = e.currentTarget.previousSibling as HTMLElement;
                            if (fallbackDiv) fallbackDiv.style.display = 'flex';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {/* Fallback icon if image fails to load */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{display: 'none'}}>
                          <Icon className="h-24 w-24 text-gray" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-lg text-gray-dark">{t(image.alt)}</h3>
                        <p className="text-muted-foreground">{t(image.caption)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
