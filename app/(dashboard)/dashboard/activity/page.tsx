import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  type LucideIcon,
  BookOpen,
  PlayCircle,
  Share2,
  Heart,
  ListChecks,
  Bell,
  SunMoon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  'SIGN_UP': UserPlus,
  'SIGN_IN': UserCog,
  'SIGN_OUT': LogOut,
  'UPDATE_PASSWORD': Lock,
  'DELETE_ACCOUNT': UserMinus,
  'UPDATE_ACCOUNT': Settings,
  'CREATE_TEAM': UserPlus,
  'REMOVE_TEAM_MEMBER': UserMinus,
  'INVITE_TEAM_MEMBER': Mail,
  'ACCEPT_INVITATION': CheckCircle,
  'VIEW_DAILY_CONTENT': BookOpen,
  'PLAY_AUDIO': PlayCircle,
  'SHARE_CONTENT': Share2,
  'ADD_PRAYER': Heart,
  'DELETE_PRAYER': Heart,
  'START_READING_PLAN': ListChecks,
  'COMPLETE_READING_DAY': ListChecks,
  'COMPLETE_READING_PLAN': ListChecks,
  'REQUEST_PRAYER_PAIR': UserPlus,
  'MARK_PRAYER_DONE': CheckCircle,
  'ENABLE_NOTIFICATIONS': Bell,
  'CHANGE_THEME': SunMoon,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case 'SIGN_UP':
      return 'You signed up';
    case 'SIGN_IN':
      return 'You signed in';
    case 'SIGN_OUT':
      return 'You signed out';
    case 'UPDATE_PASSWORD':
      return 'You changed your password';
    case 'DELETE_ACCOUNT':
      return 'You deleted your account';
    case 'UPDATE_ACCOUNT':
      return 'You updated your account settings';
    case 'CREATE_TEAM':
      return 'Account created';
    case 'REMOVE_TEAM_MEMBER':
      return 'Team member removed';
    case 'INVITE_TEAM_MEMBER':
      return 'Team member invited';
    case 'ACCEPT_INVITATION':
      return 'Invitation accepted';
    case 'VIEW_DAILY_CONTENT':
      return 'Viewed daily content';
    case 'PLAY_AUDIO':
      return 'Played audio reflection';
    case 'SHARE_CONTENT':
      return 'Shared daily content';
    case 'ADD_PRAYER':
      return 'Added a prayer request';
    case 'DELETE_PRAYER':
      return 'Deleted a prayer request';
    case 'START_READING_PLAN':
      return 'Started a reading plan';
    case 'COMPLETE_READING_DAY':
      return 'Completed a reading day';
    case 'COMPLETE_READING_PLAN':
      return 'Completed a reading plan';
    case 'REQUEST_PRAYER_PAIR':
      return 'Requested a prayer pair';
    case 'MARK_PRAYER_DONE':
      return 'Marked prayer as done';
    case 'ENABLE_NOTIFICATIONS':
      return 'Updated notification settings';
    case 'CHANGE_THEME':
      return 'Changed application theme';
    default:
      return `Performed action: ${action}`;
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(log.action as ActivityType);

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
