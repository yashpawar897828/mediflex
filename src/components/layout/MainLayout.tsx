
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  Barcode, 
  FileText, 
  Home, 
  Menu, 
  ScanText, 
  Users, 
  Truck, 
  Calendar,
  Database,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
}

const NavItem = ({ icon, label, href, active }: NavItemProps) => (
  <Link to={href} className="w-full">
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/" },
    { icon: <Barcode size={20} />, label: "Barcode Scanner", href: "/barcode-scanner" },
    { icon: <ScanText size={20} />, label: "OCR Scanner", href: "/ocr-scanner" },
    { icon: <Database size={20} />, label: "Inventory", href: "/inventory" },
    { icon: <BarChart size={20} />, label: "Reports", href: "/reports" },
    { icon: <Users size={20} />, label: "Regular Buyers", href: "/buyers" },
    { icon: <Truck size={20} />, label: "Distribution", href: "/distribution" },
    { icon: <Calendar size={20} />, label: "Monthly Reports", href: "/monthly-reports" },
    { icon: <FileText size={20} />, label: "Documentation", href: "/docs" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Mediflex
          </h1>
          <p className="text-sm text-muted-foreground">Healthcare Management</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={location.pathname === item.href}
            />
          ))}
        </nav>
        {user && (
          <div className="p-2 border-t border-border">
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
              Signed in as {user.name}
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Sign out</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile header and content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Mediflex
          </h1>
          <div className="flex items-center gap-2">
            {user && (
              <Button 
                variant="ghost" 
                size="icon"
                className="text-red-500"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu />
            </Button>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden p-2 border-b border-border bg-card">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={location.pathname === item.href}
                />
              ))}
            </nav>
            {user && (
              <div className="pt-2 mt-2 border-t border-border">
                <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                  Signed in as {user.name}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
