
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import BarcodeScanner from "./pages/BarcodeScanner";
import OcrScanner from "./pages/OcrScanner";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          <Route path="/barcode-scanner" element={
            <MainLayout>
              <BarcodeScanner />
            </MainLayout>
          } />
          <Route path="/ocr-scanner" element={
            <MainLayout>
              <OcrScanner />
            </MainLayout>
          } />
          <Route path="/reports" element={
            <MainLayout>
              <Reports />
            </MainLayout>
          } />
          <Route path="/inventory" element={
            <MainLayout>
              <Inventory />
            </MainLayout>
          } />
          <Route path="/buyers" element={
            <MainLayout>
              <div className="p-4">
                <h1 className="text-3xl font-bold">Regular Buyers</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/distribution" element={
            <MainLayout>
              <div className="p-4">
                <h1 className="text-3xl font-bold">Distribution Management</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/monthly-reports" element={
            <MainLayout>
              <div className="p-4">
                <h1 className="text-3xl font-bold">Monthly Reports</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </MainLayout>
          } />
          <Route path="/docs" element={
            <MainLayout>
              <div className="p-4">
                <h1 className="text-3xl font-bold">Documentation</h1>
                <p className="text-muted-foreground">Coming soon...</p>
              </div>
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
