
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Barcode, FileText, ScanText, Users, Truck } from "lucide-react";

const Dashboard = () => {
  // Sample statistics for the dashboard
  const stats = [
    { icon: <Barcode className="h-6 w-6" />, title: "Total Products", value: "2,834", description: "Products in database" },
    { icon: <ScanText className="h-6 w-6" />, title: "OCR Scans", value: "548", description: "Documents scanned" },
    { icon: <Users className="h-6 w-6" />, title: "Regular Buyers", value: "172", description: "Active customers" },
    { icon: <Truck className="h-6 w-6" />, title: "Distributions", value: "96", description: "This month" },
    { icon: <BarChart className="h-6 w-6" />, title: "Total Sales", value: "₹24,389", description: "This month" },
    { icon: <FileText className="h-6 w-6" />, title: "Reports Generated", value: "42", description: "This month" }
  ];

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
                {stat.icon}
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
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <Barcode className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Product scan: Med-X2349</p>
                  <p className="text-xs text-muted-foreground">Today, 09:15 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <ScanText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">OCR scan: Invoice #3782</p>
                  <p className="text-xs text-muted-foreground">Today, 08:30 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Distribution: Central Hospital</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 03:45 PM</p>
                </div>
              </div>
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
