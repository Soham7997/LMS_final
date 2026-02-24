import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Upload, Play, FileText, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Course, Lecture } from '../../types/api';
import apiService from '../../services/api';
import VideoPlayer from '../ui/VideoPlayer';

const LectureManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: '',
    courseId: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiService.getCourses();
        setCourses(response.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLectures(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchLectures = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getLectures(courseId);
      setLectures(response.lectures);
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
      setError('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title || !formData.scheduledAt) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await apiService.createLecture({
        courseId: formData.courseId,
        title: formData.title,
        scheduledAt: formData.scheduledAt
      });

      await fetchLectures(formData.courseId);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        scheduledAt: '',
        courseId: ''
      });
    } catch (error) {
      console.error('Failed to create lecture:', error);
      setError(error instanceof Error ? error.message : 'Failed to create lecture');
    }
  };

  const handleVideoUpload = async (lectureId: string, file: File) => {
    setIsUploading(lectureId);
    try {
      await apiService.uploadLectureRecording(lectureId, file);

      // Refresh lectures
      if (selectedCourse) {
        await fetchLectures(selectedCourse);
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isLectureUpcoming = (scheduledAt: string) => {
    return new Date(scheduledAt) > new Date();
  };

  const handleViewLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setVideoPlayerOpen(false);
    setSelectedLecture(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecture Management</h1>
            <p className="text-gray-600">Create and manage lecture schedules and recordings</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Lecture
          </button>
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lectures List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading lectures...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lectures.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No lectures found for this course</p>
                </div>
              ) : (
                lectures.map((lecture) => {
                  const { date, time } = formatDateTime(lecture.scheduledAt);
                  const upcoming = isLectureUpcoming(lecture.scheduledAt);

                  return (
                    <div key={lecture.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{lecture.title}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              upcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {upcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {time}
                            </div>
                            {lecture.recordPath && (
                              <div className="flex items-center text-green-600">
                                <Video className="w-4 h-4 mr-1" />
                                Recording available
                              </div>
                            )}
                          </div>

                          <div className="text-sm text-gray-500">
                            Course: {courses.find(c => c.id === lecture.courseId)?.title}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {lecture.recordPath ? (
                            <button
                              onClick={() => handleViewLecture(lecture)}
                              className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Play Recording
                            </button>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleVideoUpload(lecture.id, file);
                                  }
                                }}
                                className="hidden"
                                id={`video-upload-${lecture.id}`}
                                disabled={isUploading === lecture.id}
                              />
                              <label
                                htmlFor={`video-upload-${lecture.id}`}
                                className={`flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors cursor-pointer ${
                                  isUploading === lecture.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {isUploading === lecture.id ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4 mr-1" />
                                )}
                                {isUploading === lecture.id ? 'Uploading...' : 'Upload Recording'}
                              </label>
                            </div>
                          )}

                          <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Lecture Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Lecture</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Japanese Grammar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {videoPlayerOpen && selectedLecture && (
        <VideoPlayer
          lectureId={selectedLecture.id}
          lectureTitle={selectedLecture.title}
          onClose={handleCloseVideoPlayer}
        />
      )}
    </div>
  );
};

export default LectureManagement;