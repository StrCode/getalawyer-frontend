import { 
  CheckCircle, 
  Clock, 
  FileText, 
  type LucideIcon, 
  TrendingDown,
  TrendingUp, 
  Users, 
  XCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricsCardProps {
  title: string;
  value: number;
  icon: string | LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
};

const colorVariants = {
  blue: {
    background: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    background: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  yellow: {
    background: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  red: {
    background: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  purple: {
    background: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
};

export function MetricsCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  className 
}: MetricsCardProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon] : icon;
  const colorClasses = colorVariants[color];

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "p-3 rounded-lg",
              colorClasses.background,
              colorClasses.border,
              "border"
            )}>
              {IconComponent && (
                <IconComponent className={cn("h-6 w-6", colorClasses.text)} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <div className="text-right">
                <p className={cn(
                  "text-sm font-medium",
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.direction === 'up' ? '+' : ''}{trend.value}%
                </p>
                <p className="text-xs text-gray-500">{trend.period}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}