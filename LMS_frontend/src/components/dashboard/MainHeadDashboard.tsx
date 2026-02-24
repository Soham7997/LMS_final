import React, { useState, useEffect } from 'react';
import { Users, Calendar, Settings, TrendingUp, DollarSign, Award, BookOpen, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Activity, SystemOverview } from '../../types/api';

const MainHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeadData = async () => {
      try {
        const [activitiesData, overviewData] = await Promise.all([
          apiService.request<{ activities: Activity[] }>('/reports/activities/recent?limit=10'),
          apiService.getSystemOverview()
        ]);

        setActivities(activitiesData.activities);
        setSystemOverview(overviewData.overview);
      } catch (error) {
        console.error('Failed to fetch head data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Main Head Dashboard</h1>
        <p className="text-red-100">Oversee all operations and strategic management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : systemOverview?.overview.totalEnrollments || 0}
              </p>
              <p className="text-xs text-green-600">Active enrollments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : systemOverview?.overview.activeCourses || 0}
              </p>
              <p className="text-xs text-green-600">Currently active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Meetings</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : systemOverview?.overview.totalMeetings || 0}
              </p>
              <p className="text-xs text-green-600">Scheduled meetings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Recent Activities</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : activities.length}
              </p>
              <p className="text-xs text-green-600">Last 7 days</p>
            </div>
          </div>
        </div>
      </div>
        

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oversee Meetings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Oversee Meetings</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">{meeting.type}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {meeting.date} at {meeting.time}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  {meeting.attendees} attendees
                </p>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    Join Meeting
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Schedule New Meeting
          </button>
        </div>

        {/* All Staff Powers */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{staff.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    staff.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {staff.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{staff.role}</p>
                {staff.students > 0 && (
                  <p className="text-xs text-gray-500">{staff.students} students</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
              Manage Staff
            </button>
            <button className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Add Staff
            </button>
          </div>
        </div>
      </div>
      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>

        <div className="space-y-3">
          {activities.length > 0 ? activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">
                {activity.actor?.name || 'Unknown user'} {activity.action} {activity.entity.toLowerCase()}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(activity.createdAt).toLocaleDateString()}
              </span>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {loading ? 'Loading activities...' : 'No recent activities'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainHeadDashboard;