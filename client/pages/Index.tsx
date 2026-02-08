import { Navigate } from "react-router-dom";

// This is the app entry point for authenticated users
// Redirects to home if not authenticated (handled by router)
// Serves as dashboard for authenticated users
export default function Index() {
  // This component should only be reached by authenticated users
  // as defined in App.tsx ProtectedRoute
  return <Navigate to="/dashboard" replace />;
}
