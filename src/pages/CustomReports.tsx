
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, BarChart } from "lucide-react";
import { generateCustomReport } from "@/utils/ReportService";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ReportType = 'sales' | 'purchase' | 'inventory';

const CustomReports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('sales');

  const handleGenerateReport = async (format: 'excel' | 'pdf') => {
    setIsGenerating(true);
    try {
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 500));
      generateCustomReport(reportType, format);
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
        <p className="text-muted-foreground">Generate specialized reports based on your needs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Custom Report</CardTitle>
            <BarChart className="h-8 w-8 text-primary" />
          </div>
          <CardDescription>
            Select parameters and generate reports based on specific criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base">Report Type</Label>
            <RadioGroup 
              defaultValue="sales" 
              className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3"
              onValueChange={(value) => setReportType(value as ReportType)}
            >
              <div>
                <RadioGroupItem 
                  value="sales" 
                  id="sales" 
                  className="peer sr-only" 
                />
                <Label
                  htmlFor="sales"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Sales Report</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="purchase"
                  id="purchase"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="purchase"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Purchase Report</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="inventory"
                  id="inventory"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="inventory"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Inventory Report</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

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
    </div>
  );
};

export default CustomReports;
