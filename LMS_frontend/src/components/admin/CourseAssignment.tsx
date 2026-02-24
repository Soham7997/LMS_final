import React, { useState, useEffect } from 'react';
import { BookOpen, Users, UserCheck, UserX, Loader2, Search, Plus, X, Check, CheckCircle, XCircle } from 'lucide-react';
import { Course, User } from '../../types/api';
import apiService from '../../services/api';

const CourseAssignment: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'teacher' | 'student'>('teacher');
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean } | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkEnroll, setShowBulkEnroll] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, usersResponse] = await Promise.all([
        apiService.getCourses(),
        apiService.getUsers()
      ]);

      setCourses(coursesResponse.courses);
      setUsers(usersResponse.users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableUsers = (courseId: string, type: 'teacher' | 'student') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];

    if (type === 'teacher') {
      return users.filter(user =>
        user.role === 'TEACHER' &&
        !course.teachers.some((teacher: any) => teacher.id === user.id)
      );
    } else {
      // For students, we'd need enrollment data
      // This is a placeholder - in a real implementation, you'd check current enrollments
      return users.filter(user => user.role === 'STUDENT');
    }
  };

  const getAssignedUsers = (courseId: string, type: 'teacher' | 'student') => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];

    if (type === 'teacher') {
      return course.teachers;
    } else {
      // For students, return enrolled students
      return course.enrollments?.map((enrollment: any) => enrollment.student) || [];
    }
  };

  const handleAssignUser = async (courseId: string, userId: string, type: 'teacher' | 'student') => {
     setAssigning(`${courseId}-${userId}`);
     try {
       const course = courses.find(c => c.id === courseId);
       const user = users.find(u => u.id === userId);

       if (type === 'teacher') {
         // Update course with new teacher
         if (course) {
           const updatedTeachers = [...course.teachers.map((t: any) => t.id), userId];
           await apiService.createCourse({
             ...course,
             teacherIds: updatedTeachers
           });
           showToast(`${user?.name} has been assigned as a teacher to ${course.title}`, 'success');
         }
       } else {
         // For student enrollment - use the existing enrollment API
         await apiService.enrollInCourse(courseId, userId);
         showToast(`${user?.name} has been enrolled in ${course?.title}`, 'success');
       }

       await fetchData(); // Refresh data

       // Close modal after successful assignment
       if (showAssignmentModal) {
         setShowAssignmentModal(false);
         setSelectedCourse(null);
         setAssignmentType('teacher');
       }
     } catch (error) {
       console.error('Failed to assign user:', error);
       const course = courses.find(c => c.id === courseId);
       const user = users.find(u => u.id === userId);
       const action = type === 'teacher' ? 'assign as teacher' : 'enroll';
       showToast(`Failed to ${action} ${user?.name} in ${course?.title}`, 'error');
     } finally {
       setAssigning(null);
     }
   };

  const handleUnassignUser = async (courseId: string, userId: string, type: 'teacher' | 'student') => {
     setAssigning(`${courseId}-${userId}`);
     try {
       const course = courses.find(c => c.id === courseId);
       const user = users.find(u => u.id === userId);

       if (type === 'teacher') {
         if (course) {
           const updatedTeachers = course.teachers
             .filter((t: any) => t.id !== userId)
             .map((t: any) => t.id);
           await apiService.createCourse({
             ...course,
             teacherIds: updatedTeachers
           });
           showToast(`${user?.name} has been removed as a teacher from ${course.title}`, 'success');
         }
       } else {
         // For student unenrollment - use the existing unenroll endpoint
         await apiService.request(`/courses/${courseId}/enroll/${userId}`, {
           method: 'DELETE'
         });
         showToast(`${user?.name} has been unenrolled from ${course?.title}`, 'success');
       }

       await fetchData(); // Refresh data
     } catch (error) {
       console.error('Failed to unassign user:', error);
       const course = courses.find(c => c.id === courseId);
       const user = users.find(u => u.id === userId);
       const action = type === 'teacher' ? 'remove as teacher' : 'unenroll';
       showToast(`Failed to ${action} ${user?.name} from ${course?.title}`, 'error');
     } finally {
       setAssigning(null);
     }
   };

  const handleBulkEnroll = async (courseId: string) => {
    if (selectedStudents.length === 0) {
      setError('Please select students to enroll');
      return;
    }

    setAssigning(`bulk-${courseId}`);
    try {
      await apiService.bulkEnrollStudents(courseId, selectedStudents);
      setSelectedStudents([]);
      setShowBulkEnroll(false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to bulk enroll students:', error);
      setError('Failed to enroll selected students');
    } finally {
      setAssigning(null);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading course assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Assignment</h1>
            <p className="text-gray-600">Assign courses to teachers and manage student enrollments</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>Status: {course.active ? 'Active' : 'Inactive'}</span>
                    <span>•</span>
                    <span>{course._count?.enrollments || 0} students enrolled</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setAssignmentType('teacher');
                      setShowAssignmentModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Teacher
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setAssignmentType('student');
                      setShowAssignmentModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Enroll Students
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowBulkEnroll(true);
                      setSelectedStudents([]);
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Enroll
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assigned Teachers */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Assigned Teachers ({course.teachers.length})
                  </h4>
                  <div className="space-y-2">
                    {course.teachers.length > 0 ? course.teachers.map((teacher: any) => (
                      <div key={teacher.id} className="flex items-center justify-between bg-blue-50 rounded p-3">
                        <div>
                          <h5 className="font-medium text-blue-900">{teacher.name}</h5>
                          <p className="text-sm text-blue-600">{teacher.email}</p>
                        </div>
                        <button
                          onClick={() => handleUnassignUser(course.id, teacher.id, 'teacher')}
                          disabled={assigning === `${course.id}-${teacher.id}`}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {assigning === `${course.id}-${teacher.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">No teachers assigned</p>
                    )}
                  </div>
                </div>

                {/* Enrolled Students */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                    Enrolled Students ({course._count?.enrollments || 0})
                  </h4>
                  <div className="space-y-2">
                    {course.enrollments && course.enrollments.length > 0 ? (
                      course.enrollments.map((enrollment: any) => (
                        <div key={enrollment.student.id} className="flex items-center justify-between bg-green-50 rounded p-3">
                          <div>
                            <h5 className="font-medium text-green-900">{enrollment.student.name}</h5>
                            <p className="text-sm text-green-600">{enrollment.student.email}</p>
                          </div>
                          <button
                            onClick={() => handleUnassignUser(course.id, enrollment.student.id, 'student')}
                            disabled={assigning === `${course.id}-${enrollment.student.id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {assigning === `${course.id}-${enrollment.student.id}` ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No students enrolled yet</p>
                        <p className="text-sm text-gray-400">Use the "Enroll Students" button to add students</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600">No courses match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {assignmentType === 'teacher' ? 'Assign Teachers' : 'Enroll Students'} - {selectedCourse.title}
              </h3>
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedCourse(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {assignmentType === 'teacher' ? (
                <>
                  <h4 className="font-medium text-gray-900">Available Teachers</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getAvailableUsers(selectedCourse.id, 'teacher').map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{teacher.name}</h5>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                        </div>
                        <button
                          onClick={() => handleAssignUser(selectedCourse.id, teacher.id, 'teacher')}
                          disabled={assigning === `${selectedCourse.id}-${teacher.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center transform hover:scale-105"
                        >
                          {assigning === `${selectedCourse.id}-${teacher.id}` ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Assign
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                    {getAvailableUsers(selectedCourse.id, 'teacher').length === 0 && (
                      <p className="text-gray-500 text-center py-4">All teachers are already assigned to this course</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-medium text-gray-900">Available Students</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getAvailableUsers(selectedCourse.id, 'student').slice(0, 10).map((student) => (
                      <div key={student.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{student.name}</h5>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleAssignUser(selectedCourse.id, student.id, 'student')}
                          disabled={assigning === `${selectedCourse.id}-${student.id}`}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center transform hover:scale-105"
                        >
                          {assigning === `${selectedCourse.id}-${student.id}` ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Enroll
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                    {getAvailableUsers(selectedCourse.id, 'student').length === 0 && (
                      <p className="text-gray-500 text-center py-4">No students available for enrollment</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Enroll Modal */}
      {showBulkEnroll && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bulk Enroll Students - {selectedCourse.title}
              </h3>
              <button
                onClick={() => {
                  setShowBulkEnroll(false);
                  setSelectedStudents([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Available Students</h4>
                <div className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getAvailableUsers(selectedCourse.id, 'student').map((student) => (
                  <div key={student.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">{student.name}</h5>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {getAvailableUsers(selectedCourse.id, 'student').length === 0 && (
                  <p className="text-gray-500 text-center py-4">All students are already enrolled in this course</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkEnroll(false);
                    setSelectedStudents([]);
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={assigning === `bulk-${selectedCourse.id}`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkEnroll(selectedCourse.id)}
                  disabled={assigning === `bulk-${selectedCourse.id}` || selectedStudents.length === 0}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {assigning === `bulk-${selectedCourse.id}` ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Enroll {selectedStudents.length} Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-md shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        } ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseAssignment;