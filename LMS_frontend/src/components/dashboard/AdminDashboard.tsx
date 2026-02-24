import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Users, Calendar, FileText, Settings, TrendingUp, Award, Eye, Download, UserPlus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import PDFViewer from '../ui/PDFViewer';
import VideoPlayer from '../ui/VideoPlayer';
import FileUpload from '../ui/FileUpload';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [uploadType, setUploadType] = useState<'material' | 'video'>('material');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // First, try to fetch courses separately to debug
      console.log('Fetching courses...');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user);
      let coursesResponse;
      try {
        coursesResponse = await apiService.getCourses();
        console.log('Courses API response:', coursesResponse);
        console.log('Courses array:', coursesResponse?.courses);
      } catch (coursesError) {
        console.error('Failed to fetch courses:', coursesError);
        console.error('Error details:', coursesError);
        coursesResponse = { courses: [] };
      }

      const [overviewResponse, userStatsResponse, adminMaterialsResponse, materialStatsResponse] = await Promise.all([
        apiService.getSystemOverview(),
        apiService.getUserStats(),
        apiService.getAdminMaterials(10),
        apiService.getAdminMaterialStats()
      ]);

      // Combine data from different APIs to create comprehensive stats
      const overview = overviewResponse.overview;
      const userStats = userStatsResponse.userStats;
      const materialStats = materialStatsResponse.stats;
      console.log("ea",userStatsResponse);
      console.log(userStats);

      // Create combined stats object
      const combinedStats = {
        totalStudents: userStats.find((stat: any) => stat.role === 'STUDENT')?._count?.id || 0,
        totalTeachers: userStats.find((stat: any) => stat.role === 'TEACHER')?._count?.id || 0,
        totalAdmins: userStats.find((stat: any) => stat.role === 'ADMIN')?._count?.id || 0,
        activeCourses: overview.activeCourses || 0,
        totalCourses: overview.totalCourses || 0,
        totalMaterials: materialStats.totalMaterials || 0,
        totalLectures: materialStats.totalRecordings || 0,
        videoLectures: materialStats.totalRecordings || 0,
        totalEnrollments: overview.totalEnrollments || 0,
        totalMeetings: overview.totalMeetings || 0,
        totalNotices: overview.totalNotices || 0
      };

      setAdminStats(combinedStats);
      setRecentMaterials(adminMaterialsResponse.materials);
      setRecentVideos(adminMaterialsResponse.recordings);

      // Debug: Log courses data to check structure
      console.log('Courses response:', coursesResponse);
      console.log('Courses array:', coursesResponse.courses);
      console.log('Valid courses count:', coursesResponse.courses?.filter(course => course && course.id && course.title).length || 0);

      setCourses(coursesResponse.courses || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMaterial = (material: any) => {
    setSelectedMaterial(material);
    setPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setSelectedMaterial(null);
  };

  const handleViewVideo = (video: any) => {
    setSelectedVideo(video);
    setVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayerOpen(false);
    setSelectedVideo(null);
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

  const handleUserManagement = () => {
    navigate('/admin/users');
  };

  const handleCourseManagement = () => {
    navigate('/admin/courses');
  };

  const handleCourseAssignment = () => {
    navigate('/admin/course-assignments');
  };

  const handleUploadMaterial = (course: any) => {
    setSelectedCourse(course);
    setUploadType('material');
    setShowFileUpload(true);
  };

  const handleUploadVideo = (course: any) => {
    setSelectedCourse(course);
    setUploadType('video');
    setShowFileUpload(true);
  };

  const handleUploadMaterialGeneral = () => {
    if (!courses || courses.length === 0) {
      console.log('No courses available for upload');
      return;
    }
    setSelectedCourse(null); // No specific course selected - will show all courses
    setUploadType('material');
    setShowFileUpload(true);
  };

  const handleUploadVideoGeneral = () => {
    if (!courses || courses.length === 0) {
      console.log('No courses available for upload');
      return;
    }
    setSelectedCourse(null); // No specific course selected - will show all courses
    setUploadType('video');
    setShowFileUpload(true);
  };

  const handleUploadSuccess = () => {
    setShowFileUpload(false);
    setSelectedCourse(null);
    fetchDashboardData(); // Refresh data
  };

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">Please log in to access the admin dashboard</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Manage content and oversee platform activities</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalStudents || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{adminStats?.activeCourses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Video Lectures</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.videoLectures || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Materials</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalMaterials || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Teachers</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalTeachers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalEnrollments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Settings className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Meetings</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalMeetings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Notices</h3>
              <p className="text-2xl font-bold text-gray-900">{adminStats?.totalNotices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Study Materials */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Study Materials</h2>
          </div>

          <div className="space-y-3 mb-4">
            {recentMaterials.map((material) => (
              <div key={material.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{material.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{material.type}</span>
                </div>
                <p className="text-sm text-gray-600">By {material.uploadedBy} • {material.date}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{material.course}</span>
                  <div className="flex items-center space-x-2">
                    {isPDF(material.type) && (
                      <button
                        onClick={() => handleViewMaterial(material)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                        title="View PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadMaterial(material.id, material.title)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadMaterialGeneral}
            className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Upload New Material
          </button>
        </div>

        {/* Post Video Lectures */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Video Lectures</h2>
          </div>

          <div className="space-y-3 mb-4">
            {recentVideos.map((video) => (
              <div key={video.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{video.title}</h3>
                  <button
                    onClick={() => handleViewVideo(video)}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    title="View Video"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  By {video.instructor} • {video.duration}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{video.views} views</span>
                  <span className="text-xs text-gray-500">{video.date}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadVideoGeneral}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Upload New Video
          </button>
        </div>
      </div>

    

      {/* Management Tools */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleUserManagement}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Manage students and teachers</p>
          </button>

          <button
            onClick={handleCourseManagement}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Course Management</h3>
            <p className="text-sm text-gray-600">Create and edit courses</p>
          </button>

          <button
            onClick={handleCourseAssignment}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <UserPlus className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Course Assignment</h3>
            <p className="text-sm text-gray-600">Assign courses to students</p>
          </button>

        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">New student enrolled in Beginner course</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Tanaka Sensei uploaded new material</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Video lecture published for N3 level</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div> */}

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && selectedMaterial && (
        <PDFViewer
          materialId={selectedMaterial.id}
          materialTitle={selectedMaterial.title}
          onClose={handleClosePdfViewer}
        />
      )}

      {/* Video Player Modal */}
      {videoPlayerOpen && selectedVideo && (
        <VideoPlayer
          materialId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={handleCloseVideoPlayer}
        />
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <FileUpload
              courses={selectedCourse ? [selectedCourse] : courses}
              onUploadSuccess={handleUploadSuccess}
              uploadType={uploadType}
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
    </div>
  );
};

export default AdminDashboard;