import React, { useState, useEffect } from 'react';
import { Video, Users, Calendar, FileText, TrendingUp, Award, Plus, Eye, ExternalLink, Loader2, Activity, UserPlus, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { Course, User, Meeting, SystemOverview } from '../../types/api';
import MeetingCreator from '../ui/MeetingCreator';
import UserManagement from '../admin/UserManagement';

const HeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'staff' | 'activities'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [coursesResponse, usersResponse, overviewData] = await Promise.all([
        apiService.getCourses(),
        apiService.getUsers(),
        apiService.getSystemOverview()
      ]);

      setCourses(coursesResponse.courses);
      setUsers(usersResponse.users);
      setSystemOverview(overviewData.overview);

      // Get all meetings from all courses
      const meetingsPromises = coursesResponse.courses.map(course =>
        apiService.getMeetings(course.id)
      );

      const meetingsResults = await Promise.all(meetingsPromises);
      const allMeetings = meetingsResults.flatMap(result => result.meetings);
      setMeetings(allMeetings);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = (meeting: { id: string; meetLink?: string }) => {
    if (meeting?.meetLink) {
      window.open(meeting.meetLink, '_blank');
    } else {
      console.error('Meeting link not available for meeting:', meeting?.id);
    }
  };

  const handleCourseAssignment = () => {
    navigate('/admin/course-assignments');
  };

  const getHeadStats = () => {
    const stats = {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.active).length,
      totalStudents: courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0),
      totalStaff: users.filter(u => ['ADMIN', 'TEACHER', 'HEAD', 'MANAGEMENT'].includes(u.role)).length,
      totalMeetings: meetings.length,
      upcomingMeetings: meetings.filter(m => new Date(m.createdAt) > new Date()).length
    };
    return stats;
  };

  const stats = getHeadStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Head Dashboard</h1>
        <p className="text-purple-100">Oversee operations and manage staff</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border p-1">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'staff', label: 'Staff Management', icon: Users },
            { id: 'activities', label: 'Activities', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Staff Members</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.totalStaff}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Video className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Total Meetings</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.totalMeetings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Upcoming Meetings</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.upcomingMeetings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
                  <p className="text-xl font-bold text-gray-900">{stats.activeCourses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Course Statistics</h2>
              <button
                onClick={handleCourseAssignment}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Students
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>👥 Students: {course._count?.enrollments || 0}</p>
                    <p>📄 Materials: {course._count?.materials || 0}</p>
                    <p>🎬 Lectures: {course._count?.lectures || 0}</p>
                    <p>📅 Meetings: {course._count?.meetings || 0}</p>
                    <p className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Video className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">All Meetings</h2>
            </div>

            <div className="space-y-3 mb-6">
              {meetings.length > 0 ? meetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-600">Course: {meeting.course?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">Created by: {meeting.createdBy}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(meeting.createdAt).toLocaleDateString()} at {new Date(meeting.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinMeeting(meeting)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Join Meeting
                  </button>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No meetings scheduled</p>
              )}
            </div>

            <MeetingCreator
              courses={courses}
              onMeetingCreated={fetchDashboardData}
            />
          </div>
        </div>
      )}

      {/* Staff Management Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <UserManagement />
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>

          <div className="space-y-3">
            {/* Placeholder for activities - would need backend endpoint */}
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Activity tracking coming soon...</p>
              <p className="text-sm text-gray-400">This will show recent system activities</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default HeadDashboard;