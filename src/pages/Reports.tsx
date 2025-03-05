
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, FileSpreadsheet, FileText, Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const Reports = () => {
  const reportTypes = [
    {
      title: "Monthly Reports",
      description: "Generate comprehensive monthly reports for sales and inventory",
      icon: <Calendar className="h-8 w-8" />,
      link: "/monthly-reports"
    },
    {
      title: "Sales Reports",
      description: "Analyze sales data, trends, and customer purchasing patterns",
      icon: <TrendingUp className="h-8 w-8" />,
      link: "/sales-reports"
    },
    {
      title: "Purchase Reports",
      description: "Track all purchases, suppliers, and inventory additions",
      icon: <TrendingDown className="h-8 w-8" />,
      link: "/purchase-reports"
    },
    {
      title: "Excel Export",
      description: "Export data in Excel format for further analysis",
      icon: <FileSpreadsheet className="h-8 w-8" />,
      link: "/excel-export"
    },
    {
      title: "PDF Reports",
      description: "Generate professional PDF reports for sharing and printing",
      icon: <FileText className="h-8 w-8" />,
      link: "/pdf-reports"
    },
    {
      title: "Custom Reports",
      description: "Create customized reports with specific parameters",
      icon: <BarChart className="h-8 w-8" />,
      link: "/custom-reports"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and export detailed reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report, index) => (
          <Link key={index} to={report.link} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{report.title}</CardTitle>
                  <div className="text-primary">{report.icon}</div>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center text-sm text-primary">
                <Download className="h-4 w-4 mr-2" />
                Generate report
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Reports;
