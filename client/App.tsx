import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Placeholder pages
const GamesPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Games</h1>
      <p className="text-slate-400 mb-6">Game library coming soon. Play featured games from the dashboard!</p>
      <a href="/" className="text-yellow-400 hover:text-yellow-300 font-semibold">← Back to Dashboard</a>
    </div>
  </div>
);

const StorePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Store</h1>
      <p className="text-slate-400 mb-6">Coin store coming soon. Check back from the dashboard!</p>
      <a href="/" className="text-yellow-400 hover:text-yellow-300 font-semibold">← Back to Dashboard</a>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">Profile</h1>
      <p className="text-slate-400 mb-6">Profile and redemption page coming soon!</p>
      <a href="/" className="text-yellow-400 hover:text-yellow-300 font-semibold">← Back to Dashboard</a>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const AppContent = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* Protected routes */}
    <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
    <Route path="/games" element={<ProtectedRoute element={<GamesPage />} />} />
    <Route path="/store" element={<ProtectedRoute element={<StorePage />} />} />
    <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
