import { format } from 'date-fns';
import { Download, FileText, Loader2, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExportData } from '@/hooks/use-admin-queries';
import { useToast } from '@/hooks/use-toast';

export interface DataExportProps {
  className?: string;
  defaultType?: 'users' | 'applications' | 'audit_log' | 'statistics';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

interface ExportConfig {
  type: 'users' | 'applications' | 'audit_log' | 'statistics';
  format: 'csv' | 'excel' | 'pdf';
  columns: string[];
  includeFilters: boolean;
}

const EXPORT_TYPES = [
  { value: 'users', label: 'Users', description: 'Export user accounts and profiles' },
  { value: 'applications', label: 'Applications', description: 'Export lawyer applications and reviews' },
  { value: 'statistics', label: 'Statistics', description: 'Export analytics and metrics data' },
  { value: 'audit_log', label: 'Audit Log', description: 'Export system audit trail' },
] as const;

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values (Excel compatible)' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel spreadsheet' },
  { value: 'pdf', label: 'PDF', description: 'Portable document format' },
] as const;

const COLUMN_OPTIONS = {
  users: [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'role', label: 'Role' },
    { id: 'status', label: 'Status' },
    { id: 'country', label: 'Country' },
    { id: 'createdAt', label: 'Created Date' },
    { id: 'lastLoginAt', label: 'Last Login' },
  ],
  applications: [
    { id: 'lawyerName', label: 'Lawyer Name' },
    { id: 'lawyerEmail', label: 'Email' },
    { id: 'status', label: 'Status' },
    { id: 'country', label: 'Country' },
    { id: 'state', label: 'State' },
    { id: 'yearsOfExperience', label: 'Experience' },
    { id: 'submittedAt', label: 'Submitted Date' },
    { id: 'reviewedAt', label: 'Reviewed Date' },
    { id: 'reviewerName', label: 'Reviewer' },
  ],
  statistics: [
    { id: 'date', label: 'Date' },
    { id: 'userRegistrations', label: 'User Registrations' },
    { id: 'applicationSubmissions', label: 'Application Submissions' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'rejections', label: 'Rejections' },
    { id: 'activeUsers', label: 'Active Users' },
  ],
  audit_log: [
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'userId', label: 'User ID' },
    { id: 'userName', label: 'User Name' },
    { id: 'action', label: 'Action' },
    { id: 'resource', label: 'Resource' },
    { id: 'details', label: 'Details' },
  ],
};

export function DataExport({ 
  className, 
  defaultType = 'statistics',
  dateRange,
  filters 
}: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    type: defaultType,
    format: 'csv',
    columns: COLUMN_OPTIONS[defaultType].map(col => col.id),
    includeFilters: true,
  });
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const exportMutation = useExportData();

  const handleExport = async () => {
    try {
      setProgress(10);
      
      const exportConfig = {
        type: config.type,
        format: config.format,
        columns: config.columns,
        ...(config.includeFilters && filters && { filters }),
        ...(dateRange && { dateRange }),
      };

      setProgress(50);
      
      const blob = await exportMutation.mutateAsync(exportConfig);
      
      setProgress(90);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `${config.type}_export_${timestamp}.${config.format === 'excel' ? 'xlsx' : config.format}`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setProgress(100);
      
      toast({
        title: 'Export Successful',
        description: `${config.type} data exported as ${config.format.toUpperCase()}`,
      });

      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsOpen(false);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      setProgress(0);
      
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTypeChange = (type: 'users' | 'applications' | 'audit_log' | 'statistics') => {
    setConfig(prev => ({
      ...prev,
      type,
      columns: COLUMN_OPTIONS[type].map(col => col.id),
    }));
  };

  const handleColumnToggle = (columnId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      columns: checked 
        ? [...prev.columns, columnId]
        : prev.columns.filter(id => id !== columnId),
    }));
  };

  const isExporting = exportMutation.isPending || progress > 0;
  const availableColumns = COLUMN_OPTIONS[config.type];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Configure and download platform data in various formats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Type Selection */}
          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select value={config.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={config.format} onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
              setConfig(prev => ({ ...prev, format: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-sm text-muted-foreground">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column Selection */}
          <div className="space-y-2">
            <Label>Columns to Include</Label>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {availableColumns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.id}
                        checked={config.columns.includes(column.id)}
                        onCheckedChange={(checked) => 
                          handleColumnToggle(column.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={column.id} className="text-sm">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFilters"
                checked={config.includeFilters}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeFilters: checked as boolean }))
                }
              />
              <Label htmlFor="includeFilters" className="text-sm">
                Apply current filters to export
              </Label>
            </div>
          </div>

          {/* Date Range Info */}
          {dateRange && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Date Range</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - {' '}
                  {format(new Date(dateRange.endDate), 'MMM dd, yyyy')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || config.columns.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}