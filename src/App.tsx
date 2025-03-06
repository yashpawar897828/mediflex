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
import DailyReports from "./pages/DailyReports";
import MonthlyReports from "./pages/MonthlyReports";
import CustomReports from "./pages/CustomReports";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RegularBuyers from "./pages/RegularBuyers";
import Distributors from "./pages/Distributors";

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
            <Route path="/daily-reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <DailyReports />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/monthly-reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <MonthlyReports />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/custom-reports" element={
              <ProtectedRoute>
                <MainLayout>
                  <CustomReports />
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
                  <RegularBuyers />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/distribution" element={
              <ProtectedRoute>
                <MainLayout>
                  <Distributors />
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
