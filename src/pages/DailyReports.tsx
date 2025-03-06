
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileSpreadsheet, FileText } from "lucide-react";
import { generateDailyReport } from "@/utils/ReportService";
import { toast } from "sonner";

const DailyReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (format: 'excel' | 'pdf') => {
    setIsGenerating(true);
    try {
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 500));
      generateDailyReport(format);
      toast.success(`Daily report generated successfully in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const today = new Date().toLocaleDateString();

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
          <div className="text-center text-muted-foreground py-8">
            Previous reports will be available here once generated.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyReports;
