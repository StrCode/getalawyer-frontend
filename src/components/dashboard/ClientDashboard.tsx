import { 
  RecommendedLawyers,
  ActiveCases,
  Notifications,
  ScheduleCalendar,
  Meetings
} from './client';

export function ClientDashboard() {
  return (
    <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
      {/* Left Column - Main Content */}
      <div className="space-y-6 lg:col-span-2">
        <RecommendedLawyers />
        
        {/* Active Cases and Notifications */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <ActiveCases />
          <Notifications />
        </div>
      </div>

      {/* Right Column - Schedule & Meetings */}
      <div className="space-y-6">
        <ScheduleCalendar />
        <Meetings />
      </div>
    </div>
  );
}
