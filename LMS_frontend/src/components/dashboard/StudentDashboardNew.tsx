import React, { useState, useEffect } from 'react';
import { Video, BookOpen, MessageSquare, Calendar, Play, Download, Clock, Users, ExternalLink, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, Material, Meeting, Notice, Lecture } from '../../types/api';
import PDFViewer from '../ui/PDFViewer';
import VideoPlayer from '../ui/VideoPlayer';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      console.log('User authenticated as STUDENT, fetching dashboard data');
      fetchDashboardData();
    } else {
      console.log('User not authenticated or not a student:', user);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching dashboard data for user:', user?.id);

      // Fetch all courses with enrollment data
      const coursesResponse = await apiService.getCourses();
      const allCourses = coursesResponse.courses;
      console.log('All courses:', allCourses);

      // Find courses where the current user is enrolled
      const enrolledCourses = allCourses.filter(course =>
        course.enrollments?.some((enrollment: any) => enrollment.studentId === user?.id) && course.active
      );
      console.log('Enrolled courses:', enrolledCourses);

      if (enrolledCourses.length > 0) {
        // Show all enrolled courses
        setCourses(enrolledCourses);

        // Fetch data for all enrolled courses
        const allMaterialsPromises = enrolledCourses.map(course => apiService.getMaterials(course.id));
        const allMeetingsPromises = enrolledCourses.map(course => apiService.getMeetings(course.id));
        const allNoticesPromises = enrolledCourses.map(course => apiService.getNotices(course.id));
        const allLecturesPromises = enrolledCourses.map(course => apiService.getLectures(course.id));

        const [materialsResults, meetingsResults, noticesResults, lecturesResults] = await Promise.all([
          Promise.all(allMaterialsPromises),
          Promise.all(allMeetingsPromises),
          Promise.all(allNoticesPromises),
          Promise.all(allLecturesPromises)
        ]);

        // Flatten all results
        const allMaterials = materialsResults.flatMap(result => result.materials || []);
        const allMeetings = meetingsResults.flatMap(result => result.meetings || []);
        const allNotices = noticesResults.flatMap(result => result.notices || []);
        const allLectures = lecturesResults.flatMap(result => result.lectures || []);

        console.log('Fetched data:', {
          materials: allMaterials.length,
          meetings: allMeetings.length,
          notices: allNotices.length,
          lectures: allLectures.length
        });

        setMaterials(allMaterials);
        setMeetings(allMeetings);
        setNotices(allNotices);
        setLectures(allLectures);
      } else {
        // Student is not enrolled in any courses
        console.log('No enrolled courses found');
        setCourses([]);
        setMaterials([]);
        setMeetings([]);
        setNotices([]);
        setLectures([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
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

  const handleViewMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setSelectedMaterial(null);
  };

  const isPDF = (filePath: string) => {
    return filePath.toLowerCase().endsWith('.pdf');
  };

  const handleViewLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayerOpen(false);
    setSelectedLecture(null);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'STUDY_MATERIAL':
        return <BookOpen className="w-5 h-5 text-red-500" />;
      case 'RECORDED_LECTURE':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const allMeetings = meetings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Separate lectures and study materials
  const allLectures = lectures; // Show all lectures, not just recorded ones
  const recordedLectures = lectures.filter(lecture => lecture.recordPath && lecture.recordPath.trim() !== ''); // Lectures with recordings
  const studyMaterials = materials.filter(material => material.type === 'STUDY_MATERIAL'); // Only study materials
  const recordedVideos = materials.filter(material => material.type === 'RECORDED_LECTURE'); // Recorded lectures as materials

  // Combine recorded lectures and recorded videos for display
  const allRecordedContent = [
    ...recordedLectures.map(lecture => ({ type: 'lecture', data: lecture })),
    ...recordedVideos.map(video => ({ type: 'material', data: video }))
  ];

  // Debug logging
  console.log('Dashboard state:', {
    courses: courses.length,
    materials: materials.length,
    meetings: meetings.length,
    lectures: lectures.length,
    notices: notices.length,
    allLectures: allLectures.length,
    recordedLectures: recordedLectures.length,
    studyMaterials: studyMaterials.length,
    recordedVideos: recordedVideos.length,
    allMeetings: allMeetings.length,
    allRecordedContent: allRecordedContent.length
  });

  // Debug lecture data
  console.log('Lecture details:', lectures.map(lecture => ({
    id: lecture.id,
    title: lecture.title,
    recordPath: lecture.recordPath,
    hasRecordPath: !!lecture.recordPath,
    recordPathLength: lecture.recordPath?.length || 0
  })));

  // Debug recorded content
  console.log('Recorded content details:', allRecordedContent.map((item, index) => ({
    index,
    type: item.type,
    id: item.data.id,
    title: item.data.title,
    courseId: item.data.courseId
  })));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-indigo-100">
          {courses.length > 0
            ? `You are enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}. Continue your Japanese learning journey!`
            : "Ready to start your Japanese learning journey?"
          }
        </p>
        {courses.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {courses.slice(0, 3).map((course) => (
              <span key={course.id} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                {course.title}
              </span>
            ))}
            {courses.length > 3 && (
              <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                +{courses.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* No Courses Enrolled Message */}
      {courses.length === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Courses Enrolled</h3>
            <p className="text-yellow-700 mb-4">
              You haven't enrolled in any courses yet. Contact your administrator to get enrolled in a course.
            </p>
            <p className="text-sm text-yellow-600">
              Once enrolled, you'll be able to access meetings, lectures, materials, and notices here.
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Content - Only show if enrolled in courses */}
      {courses.length > 0 && (
        <div className="space-y-6">
          {/* Course Overview */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{course.description || 'No description'}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Materials: {course._count?.materials || 0}</span>
                    <span>Lectures: {course._count?.lectures || 0}</span>
                    <span>Meetings: {course._count?.meetings || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lectures Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">All Lectures</h2>
                {allLectures.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {allLectures.length} lecture{allLectures.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {allLectures.length > 0 ? allLectures.slice(0, 4).map((lecture) => (
                  <div key={lecture.id} className="group p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 border border-purple-100">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">{lecture.title}</h3>
                        <p className="text-sm text-gray-600">
                          Course: <span className="font-medium text-purple-700">{courses.find(c => c.id === lecture.courseId)?.title || `Course ${lecture.courseId}`}</span>
                        </p>
                      </div>
                      {lecture.recordPath && (
                        <button
                          onClick={() => handleViewLecture(lecture)}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          title="Watch Recording"
                        >
                          <Play className="w-3 h-3" />
                          <span>Watch</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(lecture.scheduledAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lecture.recordPath ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Recorded</span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Scheduled</span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No lectures scheduled</p>
                    <p className="text-sm text-gray-400">Upcoming lectures will appear here</p>
                  </div>
                )}
                {allLectures.length > 4 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500">
                      And {allLectures.length - 4} more lecture{allLectures.length - 4 > 1 ? 's' : ''}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Study Materials Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Study Materials</h2>
              </div>

              <div className="space-y-3">
                {studyMaterials.length > 0 ? studyMaterials.map((material) => (
                  <div key={material.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {getFileIcon(material.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{material.title}</h3>
                      <p className="text-xs text-gray-600">
                        Course: {courses.find(c => c.id === material.courseId)?.title || `Course ${material.courseId}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isPDF(material.filePath) && (
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
                )) : (
                  <p className="text-gray-500 text-center py-4">No study materials available</p>
                )}
              </div>
            </div>

            {/* Meetings Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">All Meetings</h2>
              </div>

              <div className="space-y-3">
                {allMeetings.length > 0 ? allMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-1">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(meeting.createdAt).toLocaleDateString()} at {new Date(meeting.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Course: {courses.find(c => c.id === meeting.courseId)?.title || `Course ${meeting.courseId}`}
                    </p>
                    <button
                      onClick={() => handleJoinMeeting(meeting)}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Meeting
                    </button>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
                )}
              </div>
            </div>

            {/* Recorded Videos Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Play className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Recorded Videos</h2>
                {allRecordedContent.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {allRecordedContent.length} video{allRecordedContent.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {allRecordedContent.length > 0 ? allRecordedContent.map((item, index) => {
                  if (item.type === 'lecture') {
                    const lecture = item.data as Lecture;
                    return (
                      <div key={`lecture-${lecture.id}`} className="group flex space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-100">
                        <div className="w-20 h-14 bg-red-200 rounded-lg flex items-center justify-center shadow-sm">
                          <Play className="w-7 h-7 text-red-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base truncate mb-1">{lecture.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Course: <span className="font-medium text-red-700">{courses.find(c => c.id === lecture.courseId)?.title || `Course ${lecture.courseId}`}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Recorded: {new Date(lecture.scheduledAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Live Session</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => handleViewLecture(lecture)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            <Play className="w-4 h-4" />
                            <span className="text-sm font-medium">Watch Now</span>
                          </button>
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            ✓ Available
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    const material = item.data as Material;
                    return (
                      <div key={`material-${material.id}`} className="group flex space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-100">
                        <div className="w-20 h-14 bg-red-200 rounded-lg flex items-center justify-center shadow-sm">
                          <Play className="w-7 h-7 text-red-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base truncate mb-1">{material.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Course: <span className="font-medium text-red-700">{courses.find(c => c.id === material.courseId)?.title || `Course ${material.courseId}`}</span>
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Uploaded: {new Date(material.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Video className="w-3 h-3" />
                              <span>Recorded Lecture</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <button
                            onClick={() => handleViewMaterial(material)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                          >
                            <Play className="w-4 h-4" />
                            <span className="text-sm font-medium">Watch Now</span>
                          </button>
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            ✓ Available
                          </span>
                        </div>
                      </div>
                    );
                  }
                }) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No recorded videos yet</p>
                    <p className="text-sm text-gray-400">Videos will appear here after lectures are recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Tools - Always show */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Communication Tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Class Chat</h3>
            <p className="text-sm text-gray-600">Chat with classmates and teachers</p>
          </button>

          

          {/* <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule</h3>
            <p className="text-sm text-gray-600">View your class schedule</p>
          </button> */}
        </div>
      </div>

      {/* Course Notices - Show notices from all enrolled courses */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Course Notices</h2>
          </div>

          <div className="space-y-3">
            {notices.length > 0 ? notices.slice(0, 5).map(notice => (
              <div key={notice.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-orange-900">{notice.title}</h3>
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    {courses.find(c => c.id === notice.courseId)?.title || (notice.courseId ? `Course ${notice.courseId}` : 'General')}
                  </span>
                </div>
                <p className="text-orange-800 text-sm mb-2">{notice.body}</p>
                <p className="text-xs text-orange-600">
                  Posted {new Date(notice.createdAt).toLocaleDateString()} by {notice.postedBy}
                </p>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No notices from your courses</p>
            )}
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

      {/* Video Player Modal */}
      {videoPlayerOpen && selectedLecture && (
        <VideoPlayer
          lectureId={selectedLecture.id}
          title={selectedLecture.title}
          onClose={handleCloseVideoPlayer}
        />
      )}
    </div>
  );
};

export default StudentDashboard;