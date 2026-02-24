import React, { useState, useEffect } from 'react';
import { Video, FileText, Calendar, Users, BookOpen, MessageSquare, Plus, Eye, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import PDFViewer from '../ui/PDFViewer';
import FileUpload from '../ui/FileUpload';
import MeetingCreator from '../ui/MeetingCreator';
import NoticeCreator from '../ui/NoticeCreator';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMeetingCreator, setShowMeetingCreator] = useState(false);
  const [showNoticeCreator, setShowNoticeCreator] = useState(false);
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

      // Get teacher's courses
      const coursesResponse = await apiService.getMyCourses();
      const teacherCourses = coursesResponse.courses;
      setCourses(teacherCourses);

      // Get teacher statistics
      const statsResponse = await apiService.getTeacherStats();
      setTeacherStats(statsResponse.stats);

      if (teacherCourses.length > 0) {
        // Get upcoming classes
        const classesResponse = await apiService.getUpcomingClasses();
        setUpcomingClasses(classesResponse.classes);

        // Get recent materials from all teacher's courses
        const materialsPromises = teacherCourses.map((course: any) =>
          apiService.getMaterials(course.id)
        );
        const materialsResults = await Promise.all(materialsPromises);
        const allMaterials = materialsResults.flatMap(result => result.materials);
        setRecentMaterials(allMaterials.slice(0, 5)); // Show latest 5

        // Get recent notices from all teacher's courses
        const noticesPromises = teacherCourses.map((course: any) =>
          apiService.getNotices(course.id)
        );
        const noticesResults = await Promise.all(noticesPromises);
        const allNotices = noticesResults.flatMap(result => result.notices);
        setRecentNotices(allNotices.slice(0, 5)); // Show latest 5
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = (course: any) => {
    setSelectedCourse(course);
    setShowMeetingCreator(true);
  };

  const handleCreateNotice = (course: any) => {
    setSelectedCourse(course);
    setShowNoticeCreator(true);
  };

  const handleUploadMaterial = (course: any) => {
    setSelectedCourse(course);
    setShowFileUpload(true);
  };

  const handleStartMeeting = (class_: any) => {
    // For now, we'll redirect to a placeholder Google Meet link
    // In a real implementation, this would use the actual meeting link from the backend
    window.open('https://meet.google.com/', '_blank');
  };

  const handleCreateNewNotice = () => {
    // Open notice creator without selecting a specific course (general notice)
    setSelectedCourse(null);
    setShowNoticeCreator(true);
  };

  const handleManageCourse = (course: any) => {
    // Navigate to course management page
    window.location.href = `/course/${course.id}`;
  };

  const handleMeetingCreated = () => {
    setShowMeetingCreator(false);
    setSelectedCourse(null);
    fetchDashboardData(); // Refresh data
  };

  const handleNoticeCreated = () => {
    setShowNoticeCreator(false);
    setSelectedCourse(null);
    fetchDashboardData(); // Refresh data
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

  const isPDF = (filePath: string) => {
    return filePath.toLowerCase().endsWith('.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-blue-100">Manage your classes and students</p>
      </div>

      

      {/* Course Management */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>

        <div className="space-y-4">
          {courses.length > 0 ? courses.map((course: any) => (
            <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>👥 {course._count?.enrollments || 0} students</span>
                    <span>📄 {course._count?.materials || 0} materials</span>
                    <span>🎬 {course._count?.lectures || 0} lectures</span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleCreateMeeting(course)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  <Video className="w-4 h-4 mr-1" />
                  Meeting
                </button>
                <button
                  onClick={() => handleCreateNotice(course)}
                  className="flex items-center justify-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Notice
                </button>
                <button
                  onClick={() => handleUploadMaterial(course)}
                  className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Upload
                </button>
                <button
                  onClick={() => handleManageCourse(course)}
                  className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Manage
                </button>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">No courses assigned</p>
          )}
        </div>
      </div>

     

    

      {/* Meeting Creator Modal */}
      {showMeetingCreator && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <MeetingCreator
              courses={[selectedCourse]}
              onMeetingCreated={handleMeetingCreated}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMeetingCreator(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Creator Modal */}
      {showNoticeCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <NoticeCreator
              courses={selectedCourse ? [selectedCourse] : []}
              onNoticeCreated={handleNoticeCreated}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowNoticeCreator(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default TeacherDashboard;