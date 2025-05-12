
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useTranslation } from '@/hooks/useTranslation';

export function PageNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const routes = [
    { path: '/', label: t("home") },
    { path: '/index', label: t("index") },
    { path: '/timetable', label: t("timetable") },
    { path: '/admin', label: t("adminPanel") }
  ];

  const currentRouteIndex = routes.findIndex(route => route.path === location.pathname);
  
  const hasPrevious = currentRouteIndex > 0;
  const hasNext = currentRouteIndex < routes.length - 1 && currentRouteIndex !== -1;
  
  const getPreviousRoute = () => {
    return currentRouteIndex > 0 ? routes[currentRouteIndex - 1].path : routes[0].path;
  };
  
  const getNextRoute = () => {
    return (currentRouteIndex < routes.length - 1 && currentRouteIndex !== -1) 
      ? routes[currentRouteIndex + 1].path 
      : routes[routes.length - 1].path;
  };

  return (
    <div className="w-full flex justify-center my-8 px-4">
      <Pagination>
        <PaginationContent className="flex items-center space-x-4 md:space-x-6">
          {hasPrevious && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => navigate(getPreviousRoute())}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
          
          <div className="hidden md:flex space-x-4">
            {routes.map((route) => (
              <PaginationItem key={route.path}>
                <PaginationLink
                  isActive={location.pathname === route.path}
                  onClick={() => navigate(route.path)}
                  className="cursor-pointer min-w-[100px] text-center"
                >
                  {route.label}
                </PaginationLink>
              </PaginationItem>
            ))}
          </div>
          
          {hasNext && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => navigate(getNextRoute())}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
