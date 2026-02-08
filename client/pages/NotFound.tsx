import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="text-8xl font-bold mb-4 gradient-gold bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-2xl text-slate-300 mb-6">Oops! Page not found</p>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 font-bold rounded-lg hover:opacity-90 transition"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
