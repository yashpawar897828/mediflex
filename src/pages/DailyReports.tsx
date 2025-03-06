import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileSpreadsheet, FileText, Download } from "lucide-react";
import { generateDailyReport, ReportMetadata } from "@/utils/ReportService";
import { toast } from "sonner";

type Report = ReportMetadata;

const DailyReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    const savedReports = localStorage.getItem('dailyReports');
    if (savedReports) {
      setRecentReports(JSON.parse(savedReports));
    }
  }, []);

  useEffect(() => {
    if (recentReports.length) {
      localStorage.setItem('dailyReports', JSON.stringify(recentReports));
    }
  }, [recentReports]);

  const handleGenerateReport = async (format: 'excel' | 'pdf') => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const reportMeta = generateDailyReport(format);
      
      if (reportMeta) {
        setRecentReports(prev => {
          const updatedReports = [reportMeta, ...prev.slice(0, 4)];
          return updatedReports;
        });
      }
      
      toast.success(`Daily report generated successfully in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daily Reports</h1>
        <p className="text-muted-foreground">Generate and download daily reports</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daily Report for {today}</CardTitle>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardDescription>
            Generate a summary report of today's sales, purchases, and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button 
              className="flex-1" 
              onClick={() => handleGenerateReport('excel')}
              disabled={isGenerating}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Daily Reports</CardTitle>
          <CardDescription>
            Access and download reports from previous days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between border p-4 rounded-md"
                >
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Generated: {formatDate(report.date)} | Format: {report.type.toUpperCase()}
                    </p>
                  </div>
                  <Button variant="ghost" className="h-8 w-8 p-0" title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No recent reports. Generate a report to see it here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReports;
