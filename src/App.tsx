
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import BarcodeScanner from "./pages/BarcodeScanner";
import OcrScanner from "./pages/OcrScanner";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/barcode-scanner" element={
              <ProtectedRoute>
                <MainLayout>
                  <BarcodeScanner />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ocr-scanner" element={
              <ProtectedRoute>
                <MainLayout>
                  <OcrScanner />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <MainLayout>
                  <Inventory />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/buyers" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">
                    <h1 className="text-3xl font-bold">Regular Buyers</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/distribution" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">
                    <h1 className="text-3xl font-bold">Distribution Management</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/monthly-reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">
                    <h1 className="text-3xl font-bold">Monthly Reports</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/docs" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">
                    <h1 className="text-3xl font-bold">Documentation</h1>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
