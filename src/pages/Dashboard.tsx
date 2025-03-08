
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Barcode, FileText, ScanText, Users, Truck } from "lucide-react";
import { dashboardService, RecentActivity } from "@/services/DashboardService";

const Dashboard = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = () => {
      const dashboardStats = dashboardService.getDashboardStats();
      const recentActivities = dashboardService.getRecentActivities();
      
      setStats(dashboardStats);
      setActivities(recentActivities);
    };
    
    // Load initial data
    loadDashboardData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(loadDashboardData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Get icon for a statistic
  const getStatIcon = (title: string) => {
    switch (title) {
      case "Total Products":
        return <Barcode className="h-6 w-6" />;
      case "OCR Scans":
        return <ScanText className="h-6 w-6" />;
      case "Regular Buyers":
        return <Users className="h-6 w-6" />;
      case "Distributions":
        return <Truck className="h-6 w-6" />;
      case "Total Sales":
        return <BarChart className="h-6 w-6" />;
      case "Reports Generated":
        return <FileText className="h-6 w-6" />;
      default:
        return <Barcode className="h-6 w-6" />;
    }
  };

  // Get icon for an activity
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'barcode':
        return <Barcode className="h-4 w-4 text-primary" />;
      case 'ocr':
        return <ScanText className="h-4 w-4 text-primary" />;
      case 'distribution':
        return <Truck className="h-4 w-4 text-primary" />;
      default:
        return <Barcode className="h-4 w-4 text-primary" />;
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (timestamp.toDateString() === now.toDateString()) {
      return `Today, ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return timestamp.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Mediflex healthcare management system.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-md bg-primary/10 p-1 text-primary">
                {getStatIcon(stat.title)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent scanning and inventory activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used functionalities</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="rounded-md border border-border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Barcode className="h-5 w-5" />
                <div>
                  <p className="font-medium">Scan Barcode</p>
                  <p className="text-xs text-muted-foreground">Scan product barcodes for inventory</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <ScanText className="h-5 w-5" />
                <div>
                  <p className="font-medium">OCR Scanner</p>
                  <p className="text-xs text-muted-foreground">Extract text from documents</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="font-medium">Generate Report</p>
                  <p className="text-xs text-muted-foreground">Create monthly sales or inventory reports</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
