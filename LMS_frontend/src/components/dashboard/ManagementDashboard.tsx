import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Calendar, Users, Settings, TrendingUp, FileText, Eye, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import PDFViewer from '../ui/PDFViewer';
import FileUpload from '../ui/FileUpload';
import MeetingCreator from '../ui/MeetingCreator';
import NoticeCreator from '../ui/NoticeCreator';

const ManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all courses and recent enrollments
      const [coursesResponse, enrollmentsResponse, materialsResponse] = await Promise.all([
        apiService.getCourses(),
        apiService.getRecentEnrollments(10),
        apiService.getRecentMaterials(10)
      ]);

      setCourses(coursesResponse.courses);
      setRecentEnrollments(enrollmentsResponse.enrollments);
      setRecentMaterials(materialsResponse.materials);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (courseId: string, enrollmentId: string) => {
    try {
      await apiService.approveEnrollment(courseId, enrollmentId);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to approve enrollment:', err);
    }
  };

  const handleAddCourse = () => {
    // Navigate to course creation page
    window.location.href = '/admin/courses/new';
  };

  const handleUploadMaterial = (course: any) => {
    setSelectedCourse(course);
    setShowFileUpload(true);
  };

  const handleViewStudents = (course: any) => {
    // Navigate to course details or students page
    window.location.href = `/course/${course.id}`;
  };

  const handleUploadSuccess = () => {
    setShowFileUpload(false);
    setSelectedCourse(null);
    fetchDashboardData(); // Refresh data
  };

  const handleViewMaterial = (material: any) => {
    setSelectedMaterial(material);
    setPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setSelectedMaterial(null);
  };

  const handleDownloadMaterial = async (materialId: string, fileName: string) => {
    try {
      const blob = await apiService.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading material:', err);
    }
  };

  const isPDF = (type: string) => {
    return type === 'PDF';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Management Team Dashboard</h1>
        <p className="text-teal-100">Comprehensive course and enrollment management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Scheduled Classes</h3>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
          </div>
        </div> */}

        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">89%</p>
            </div>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Courses */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
            </div>
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Course
            </button>
          </div>

          <div className="space-y-3">
            {courses.length > 0 ? courses.map((course: any) => (
              <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    course.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {course.description}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Students: {course._count?.enrollments || 0} • Materials: {course._count?.materials || 0}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewStudents(course)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                  >
                    View Students
                  </button>
                  <button
                    onClick={() => handleUploadMaterial(course)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Upload Material
                  </button>
                  <button className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No courses available</p>
            )}
          </div>
        </div>

        {/* Remove Courses */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Enrollments</h2>
          </div>

          <div className="space-y-3">
            {recentEnrollments.length > 0 ? recentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{enrollment.student.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    enrollment.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{enrollment.course.title}</p>
                <p className="text-sm text-gray-600 mb-2">Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewStudents(enrollment.course)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApproveEnrollment(enrollment.course.id, enrollment.id)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No recent enrollments</p>
            )}
          </div>
        </div>
      </div>

      {/* Manage Schedules */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Schedules</h2>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add Schedule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{schedule.course}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.time}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.instructor}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.room}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 */}
      {/* Manage Enrollments */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Settings className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-600">Course and enrollment reports</p>
          </button>

          {/* <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule Overview</h3>
            <p className="text-sm text-gray-600">View all schedules</p>
          </button> */}


        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <FileUpload
              courses={[selectedCourse]}
              onUploadSuccess={handleUploadSuccess}
              uploadType="material"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowFileUpload(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && selectedMaterial && (
        <PDFViewer
          materialId={selectedMaterial.id}
          materialTitle={selectedMaterial.title}
          onClose={handleClosePdfViewer}
        />
      )}
    </div>
  );
};

export default ManagementDashboard;