import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Clock, FileText, Video, Calendar, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { User } from '../../types/api';

interface ActivityItem {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  actor?: User;
}

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ limit = 10, showHeader = true }) => {
  const { user, canViewActivities } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError('');

        // Check if user has permission to view activities
        if (!canViewActivities()) {
          setError('You do not have permission to view activities');
          setLoading(false);
          return;
        }

        // Try to fetch recent activities (requires HEAD role)
        try {
          const response = await apiService.getRecentActivities(limit);
          setActivities(response.activities);
        } catch (apiError) {
          // If user doesn't have HEAD role, try to fetch activities by their own actor ID
          try {
            const response = await apiService.getActivitiesByActor(user?.id || '', limit);
            setActivities(response.activities);
          } catch (actorError) {
            // If that also fails, show a message about insufficient permissions
            setError('Unable to load activities. Insufficient permissions.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit, user?.id, canViewActivities]);

  const getActivityIcon = (entity: string, action: string) => {
    switch (entity) {
      case 'course':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'material':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'lecture':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'notice':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const actorName = activity.actor?.name || 'Unknown User';
    const entityName = activity.entity.charAt(0).toUpperCase() + activity.entity.slice(1);

    switch (activity.action) {
      case 'created':
        return `${actorName} created a new ${entityName}`;
      case 'uploaded':
        return `${actorName} uploaded a ${entityName}`;
      case 'enrolled':
        return `${actorName} enrolled in a ${entityName}`;
      case 'updated':
        return `${actorName} updated a ${entityName}`;
      case 'deleted':
        return `${actorName} deleted a ${entityName}`;
      default:
        return `${actorName} ${activity.action} a ${entityName}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
        <span className="ml-2 text-sm text-gray-600">Loading activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, limit).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.entity, activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;