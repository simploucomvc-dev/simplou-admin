import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import UsersPage from "@/pages/UsersPage";
import MetricsPage from "@/pages/MetricsPage";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();

  // Aguarda tanto o loading inicial quanto o fetchProfile pós-login
  if (loading || (user && !profile)) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== "super_admin") return <Navigate to="/login" replace />;

  return <AdminLayout>{children}</AdminLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin/usuarios"
              element={<AdminRoute><UsersPage /></AdminRoute>}
            />
            <Route
              path="/admin/metricas"
              element={<AdminRoute><MetricsPage /></AdminRoute>}
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/metricas" replace />}
            />
            <Route path="*" element={<Navigate to="/admin/metricas" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
