import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Hero from './components/Hero';
import CourseLevels from './components/CourseLevels';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import CourseEnrollmentPage from './components/courses/CourseEnrollmentPage';
import CourseDetailsPage from './components/courses/CourseDetailsPage';
import UserProfilePage from './components/profile/UserProfilePage';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Admin/Management Components
import UserManagement from './components/admin/UserManagement';
import CourseManagement from './components/admin/CourseManagement';
import CourseAssignment from './components/admin/CourseAssignment';
import MaterialManagement from './components/admin/MaterialManagement';
import LectureManagement from './components/admin/LectureManagement';
import SystemSettings from './components/admin/SystemSettings';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CourseLevels />
      <Features />
      <Testimonials />
      <CallToAction />
      <Footer />
    </div>
  );
};

// Component to handle redirects for authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Update the document title
    document.title = "日本語学院 | Japanese Language Academy";
    
    // Add fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif:wght@400;700&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/enroll"
            element={
              <ProtectedRoute>
                <CourseEnrollmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          />

          {/* Admin/Management Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <UserManagement />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Course Management</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CourseManagement />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/course-assignments"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Course Assignment</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <CourseAssignment />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Enrollment Management</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <p className="text-gray-600">Enrollment management functionality will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/materials"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Material Management</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <MaterialManagement />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/lectures"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Lecture Management</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <LectureManagement />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <p className="text-gray-600">Reports and analytics functionality will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/activities"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">System Activities</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                      <h2 className="text-lg font-semibold mb-4">Recent System Activities</h2>
                      {/* ActivityFeed component will be rendered here */}
                      <p className="text-gray-600">Activity feed will be displayed here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                  <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => window.history.back()}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            ← Back to Dashboard
                          </button>
                          <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
                        </div>
                      </div>
                    </div>
                  </header>
                  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <SystemSettings />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;