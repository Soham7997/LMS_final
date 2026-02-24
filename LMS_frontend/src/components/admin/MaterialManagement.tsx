import React, { useState, useEffect } from 'react';
import { FileText, Video, Download, Edit, Trash2, Search, Loader2, Eye, EyeOff } from 'lucide-react';
import { Material, Course } from '../../types/api';
import apiService from '../../services/api';
import MaterialUpdate from '../ui/MaterialUpdate';
import PDFViewer from '../ui/PDFViewer';

const MaterialManagement: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchAllMaterials();
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      const response = await apiService.getCourses();
      setCourses(response.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses');
    }
  };

  const fetchAllMaterials = async () => {
    try {
      setLoading(true);
      const allMaterials: Material[] = [];

      for (const course of courses) {
        try {
          const response = await apiService.getMaterials(course.id);
          allMaterials.push(...response.materials.map(material => ({
            ...material,
            course: course // Add course information to each material
          })));
        } catch (error) {
          console.error(`Failed to fetch materials for course ${course.id}:`, error);
        }
      }

      setMaterials(allMaterials);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || material.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleDownload = async (material: Material) => {
    try {
      const blob = await apiService.downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download material:', error);
      setError('Failed to download material');
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

  const handleUpdateSuccess = () => {
    setEditingMaterial(null);
    fetchAllMaterials();
  };

  const getTypeIcon = (type: string) => {
    return type === 'RECORDED_LECTURE' ? (
      <Video className="w-4 h-4 text-purple-500" />
    ) : (
      <FileText className="w-4 h-4 text-blue-500" />
    );
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'RECORDED_LECTURE'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  const formatFileSize = (filePath: string) => {
    // This is a simplified version - in a real app you'd get file size from the server
    return 'Size unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
            <p className="text-gray-600">Manage all course materials and resources</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Materials
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by title or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading materials...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(material.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{material.title}</div>
                          <div className="text-sm text-gray-500">{formatFileSize(material.filePath)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(material.type)}`}>
                        {material.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{material.course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {isPDF(material.filePath) && (
                          <button
                            onClick={() => handleViewMaterial(material)}
                            className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded"
                            title="View PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(material)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingMaterial(material)}
                          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMaterials.length === 0 && !loading && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No materials found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4">
            <MaterialUpdate
              material={editingMaterial}
              onUpdateSuccess={handleUpdateSuccess}
              onCancel={() => setEditingMaterial(null)}
            />
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

export default MaterialManagement;