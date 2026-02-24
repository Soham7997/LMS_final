// API service layer for LMS frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any; message: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials)
      }
    );

    // Store token
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async register(userData: { email: string; password: string; name: string; role: string }) {
    return await this.request<{ user: any; message: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      }
    );
  }

  async getProfile() {
    return await this.request<{ user: any }>('/auth/me');
  }

  // User management
  async getUsers() {
    return await this.request<{ users: any[] }>('/users');
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }) {
    return await this.request<{ user: any; message: string }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      }
    );
  }

  async updateUser(userId: string, userData: { email?: string; name?: string; role?: string; password?: string }) {
    return await this.request<{ user: any; message: string }>(
      `/users/${userId}`,
      {
        method: 'PUT',
        body: JSON.stringify(userData)
      }
    );
  }

  async deleteUser(userId: string) {
    return await this.request<{ message: string }>(
      `/users/${userId}`,
      {
        method: 'DELETE'
      }
    );
  }

  // Course management
  async getCourses() {
    return await this.request<{ courses: any[] }>('/courses');
  }

  /**
   * Get courses for a specific teacher
   * @param teacherInfo - Optional teacher information. If not provided, uses current authenticated user
   * @returns Promise with courses array
   *
   * Usage examples:
   * - apiService.getMyCourses() // Uses current authenticated user
   * - apiService.getMyCourses({ teacherId: '123', teacherEmail: 'teacher@example.com' }) // Specific teacher
   */
  async getMyCourses(teacherInfo?: { teacherId: string; teacherEmail: string; teacherRole?: string }) {
    // If teacherInfo is provided, send it in the request body
    if (teacherInfo) {
      return await this.request<{ courses: any[] }>('/courses/my-courses', {
        method: 'POST',
        body: JSON.stringify(teacherInfo)
      });
    }
    // Otherwise, use the current authenticated user
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Decode JWT to get current user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    const teacherInfoFromToken = {
      teacherId: payload.id,
      teacherEmail: payload.email,
      teacherRole: payload.role
    };

    return await this.request<{ courses: any[] }>('/courses/my-courses', {
      method: 'POST',
      body: JSON.stringify(teacherInfoFromToken)
    });
  }

  async getActiveCourses() {
    return await this.request<{ courses: any[] }>('/courses/active');
  }

  async getCourse(id: string) {
    return await this.request<{ course: any }>(`/courses/${id}`);
  }

  async createCourse(courseData: { title: string; description?: string; teacherIds?: string[] }) {
    return await this.request<{ course: any; message: string }>(
      '/courses',
      {
        method: 'POST',
        body: JSON.stringify(courseData)
      }
    );
  }

  async updateCourse(courseId: string, courseData: { title?: string; description?: string; active?: boolean; teacherIds?: string[] }) {
    return await this.request<{ course: any; message: string }>(
      `/courses/${courseId}`,
      {
        method: 'PUT',
        body: JSON.stringify(courseData)
      }
    );
  }

  async deleteCourse(courseId: string) {
    return await this.request<{ message: string }>(
      `/courses/${courseId}`,
      {
        method: 'DELETE'
      }
    );
  }

  async enrollInCourse(courseId: string, studentId?: string) {
    return await this.request<{ enrollment: any; message: string }>(
      `/courses/${courseId}/enroll`,
      {
        method: 'POST',
        body: JSON.stringify(studentId ? { studentId } : {})
      }
    );
  }

  async bulkEnrollStudents(courseId: string, studentIds: string[]) {
    return await this.request<{ message: string; results: any }>(
      `/courses/${courseId}/bulk-enroll`,
      {
        method: 'POST',
        body: JSON.stringify({ studentIds })
      }
    );
  }

  // Materials
  async getMaterials(courseId: string) {
    return await this.request<{ materials: any[] }>(`/materials/course/${courseId}`);
  }

  async uploadMaterial(formData: FormData) {
    const token = localStorage.getItem('auth_token');
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/materials`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateMaterial(materialId: string, updateData: { title?: string; type?: string }) {
    return await this.request<{ material: any; message: string }>(
      `/materials/${materialId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }
    );
  }

  async deleteMaterial(materialId: string) {
    return await this.request<{ message: string }>(
      `/materials/${materialId}`,
      {
        method: 'DELETE'
      }
    );
  }

  async downloadMaterial(materialId: string) {
    const token = localStorage.getItem('auth_token');
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/materials/${materialId}/download`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async viewMaterial(materialId: string) {
    const token = localStorage.getItem('auth_token');
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/materials/${materialId}/view`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Lectures
  async getLectures(courseId: string) {
    return await this.request<{ lectures: any[] }>(`/lectures/course/${courseId}`);
  }

  async createLecture(lectureData: { courseId: string; title: string; scheduledAt: string }) {
    return await this.request<{ lecture: any; message: string }>(
      '/lectures',
      {
        method: 'POST',
        body: JSON.stringify(lectureData)
      }
    );
  }

  async uploadLectureRecording(lectureId: string, videoFile: File) {
    const formData = new FormData();
    formData.append('video', videoFile);

    const token = localStorage.getItem('auth_token');
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/lectures/${lectureId}/record`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async streamLecture(lectureId: string) {
    const token = localStorage.getItem('auth_token');
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/lectures/${lectureId}/stream`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Meetings
  async getMeetings(courseId: string) {
    return await this.request<{ meetings: any[] }>(`/meetings/course/${courseId}`);
  }

  async createMeeting(meetingData: {
    courseId: string;
    title: string;
    scheduledAt: string;
    description?: string;
    meetLink?: string;
  }) {
    return await this.request<{ meeting: any; message: string }>(
      '/meetings',
      {
        method: 'POST',
        body: JSON.stringify(meetingData)
      }
    );
  }

  async joinMeeting(meetingId: string) {
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    window.location.href = `${baseUrlWithoutApi}/api/meetings/${meetingId}/join`;
  }

  // Notices
  async getNotices(courseId?: string) {
    const endpoint = courseId ? `/notices/course/${courseId}` : '/notices/general';
    return await this.request<{ notices: any[] }>(endpoint);
  }

  async createNotice(noticeData: { courseId?: string; title: string; body: string }) {
    return await this.request<{ notice: any; message: string }>(
      '/notices',
      {
        method: 'POST',
        body: JSON.stringify(noticeData)
      }
    );
  }

  // Reports
  async getEnrollmentStats() {
    return await this.request<{ enrollmentStats: any[]; totalCourses: number; totalEnrollments: number }>('/reports/enrollments');
  }

  async getActiveCoursesOverview() {
    return await this.request<{ activeCourses: any[]; totalActiveCourses: number }>('/reports/courses/active');
  }

  async getSystemOverview() {
    return await this.request<{ overview: any }>('/reports/overview');
  }

  async getUserStats() {
    return await this.request<{ userStats: any[]; totalUsers: number }>('/reports/users/stats');
  }

  // Activities
  async getRecentActivities(limit: number = 50) {
    return await this.request<{ activities: any[] }>(`/activities/recent?limit=${limit}`);
  }

  async getActivitiesByEntity(entity: string, entityId: string, limit: number = 20) {
    return await this.request<{ activities: any[] }>(`/activities/entity/${entity}/${entityId}?limit=${limit}`);
  }

  async getActivitiesByActor(actorId: string, limit: number = 20) {
    return await this.request<{ activities: any[] }>(`/activities/actor/${actorId}?limit=${limit}`);
  }

  // Password reset
  async requestPasswordReset(email: string) {
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset email');
    }

    return data;
  }

  async resetPassword(token: string, newPassword: string) {
    // Remove /api from baseURL since endpoint already includes it
    const baseUrlWithoutApi = this.baseURL.replace('/api', '');
    const response = await fetch(`${baseUrlWithoutApi}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  }

  // Recent enrollments for management dashboard
  async getRecentEnrollments(limit: number = 10) {
    return await this.request<{ enrollments: any[] }>(`/courses/recent-enrollments?limit=${limit}`);
  }

  // Approve enrollment
  async approveEnrollment(courseId: string, enrollmentId: string) {
    return await this.request<{ message: string; enrollment: any }>(
      `/courses/${courseId}/enroll/${enrollmentId}/approve`,
      {
        method: 'POST'
      }
    );
  }

  // Teacher dashboard APIs
  async getUpcomingClasses() {
    return await this.request<{ classes: any[] }>('/courses/upcoming-classes');
  }

  async getTeacherStats() {
    return await this.request<{ stats: any }>('/courses/teacher-stats');
  }


  async getRecentMaterials(limit: number = 10) {
    return await this.request<{ materials: any[] }>(`/courses/recent-materials?limit=${limit}`);
  }

  async getAllRecentMaterials(){
    return await this.request<{materials:any[]}>(`/courses/recent-all-materials`);
  }
  

  async getRecentVideos(limit: number = 10) {
    return await this.request<{ videos: any[] }>(`/courses/recent-videos?limit=${limit}`);
  }

  // Admin dashboard - Get all materials and recordings
  async getAdminMaterials(limit: number = 50) {
    return await this.request<{
      materials: any[];
      recordings: any[];
      totalMaterials: number;
      totalRecordings: number;
      totalItems: number;
    }>(`/materials/admin/all?limit=${limit}`);
  }

  // Admin dashboard - Get material statistics
  async getAdminMaterialStats() {
    return await this.request<{
      stats: {
        totalMaterials: number;
        totalRecordings: number;
        totalContent: number;
        recentMaterialsCount: number;
        recentRecordingsCount: number;
        recentContentCount: number;
      }
    }>('/materials/admin/stats');
  }

  // Logout helper
  logout() {
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;