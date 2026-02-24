import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Search, Plus, X, Check, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { User, Course, Enrollment } from '../../types/api';
import apiService from '../../services/api';

const EnrollmentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [unenrolling, setUnenrolling] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, coursesResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getCourses()
      ]);

      const studentUsers = studentsResponse.users.filter(user => user.role === 'STUDENT');
      setStudents(studentUsers);
      setCourses(coursesResponse.courses);

      // Get enrollments for each student
      const enrollmentPromises = studentUsers.map(async (student) => {
        try {
          // Note: This would need a backend endpoint to get enrollments by student
          // For now, we'll simulate this by checking course enrollments
          return [];
        } catch (err) {
          console.error(`Error fetching enrollments for student ${student.id}:`, err);
          return [];
        }
      });

      const enrollmentResults = await Promise.allSettled(enrollmentPromises);
      const allEnrollments: Enrollment[] = [];

      enrollmentResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allEnrollments.push(...result.value);
        }
      });

      setEnrollments(allEnrollments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentEnrollments = (studentId: string) => {
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  };

  const getAvailableCourses = (studentId: string) => {
    const enrolledCourseIds = getStudentEnrollments(studentId).map(e => e.courseId);
    return courses.filter(course => !enrolledCourseIds.includes(course.id));
  };

  const handleEnrollStudent = async (studentId: string, courseId: string) => {
    setEnrolling(`${studentId}-${courseId}`);
    try {
      await apiService.enrollInCourse(courseId, studentId);
      await fetchData(); // Refresh data
      setShowEnrollmentModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Failed to enroll student:', error);
      setError('Failed to enroll student in course');
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenrollStudent = async (enrollmentId: string) => {
    setUnenrolling(enrollmentId);
    try {
      // Note: This would need a backend endpoint for unenrollment
      // await apiService.unenrollStudent(enrollmentId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to unenroll student:', error);
      setError('Failed to unenroll student from course');
    } finally {
      setUnenrolling(null);
    }
  };

  const getEnrollmentStats = () => {
    const stats = {
      totalStudents: students.length,
      totalEnrollments: enrollments.length,
      averageCoursesPerStudent: students.length > 0 ? (enrollments.length / students.length).toFixed(1) : '0'
    };
    return stats;
  };

  const stats = getEnrollmentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading enrollment data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
            <p className="text-gray-600">Manage student course enrollments</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.totalEnrollments}</div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.averageCoursesPerStudent}</div>
            <div className="text-sm text-gray-600">Avg Courses/Student</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const studentEnrollments = getStudentEnrollments(student.id);
                const availableCourses = getAvailableCourses(student.id);

                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {studentEnrollments.length > 0 ? (
                          studentEnrollments.map((enrollment) => {
                            const course = courses.find(c => c.id === enrollment.courseId);
                            return (
                              <div key={enrollment.id} className="flex items-center justify-between bg-green-50 rounded px-2 py-1">
                                <span className="text-sm text-green-800">{course?.title}</span>
                                <button
                                  onClick={() => handleUnenrollStudent(enrollment.id)}
                                  disabled={unenrolling === enrollment.id}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                >
                                  {unenrolling === enrollment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-sm text-gray-500">No enrollments</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {availableCourses.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEnrollmentModal(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Enroll
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students found</p>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Enroll {selectedStudent.name} in Courses
              </h3>
              <button
                onClick={() => {
                  setShowEnrollmentModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {getAvailableCourses(selectedStudent.id).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Instructor: {course.teachers.map(t => t.name).join(', ')}</span>
                      <span>•</span>
                      <span>{course._count?.enrollments || 0} students enrolled</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEnrollStudent(selectedStudent.id, course.id)}
                    disabled={enrolling === `${selectedStudent.id}-${course.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {enrolling === `${selectedStudent.id}-${course.id}` ? (
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

              {getAvailableCourses(selectedStudent.id).length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available courses for enrollment</p>
                  <p className="text-sm text-gray-400">Student is already enrolled in all courses</p>
                </div>
              )}
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

export default EnrollmentManagement;