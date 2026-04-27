import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import IntersectObserver from "@/components/common/IntersectObserver";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layouts/Header";
import { Footer } from "@/components/layouts/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/common/RouteGuard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

import { routes } from "./routes";

const App: React.FC = () => {
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <IntersectObserver />
          <PWAInstallPrompt />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;
