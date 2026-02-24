import React, { useState, useRef } from 'react';
import { Upload, X, File, Video, FileText, Loader2 } from 'lucide-react';
import { Course } from '../../types/api';
import apiService from '../../services/api';

interface FileUploadProps {
  courses: Course[];
  onUploadSuccess: () => void;
  uploadType: 'material' | 'video';
}

const FileUpload: React.FC<FileUploadProps> = ({ courses, onUploadSuccess, uploadType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<'STUDY_MATERIAL' | 'RECORDED_LECTURE'>('STUDY_MATERIAL');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log courses prop to check what's being passed
  console.log('FileUpload courses prop:', courses);
  console.log('Courses length:', courses?.length || 0);
  console.log('Filtered courses:', courses?.filter(course => course && course.id && course.title) || []);

  // Check if courses is loading or empty
  const validCourses = courses?.filter(course => course && course.id && course.title) || [];
  const isLoadingCourses = !courses || courses.length === 0;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.')[0]); // Set default title from filename
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCourse || !title) {
      setError('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('courseId', selectedCourse);
      formData.append('title', title);
      formData.append('file', selectedFile);

      if (uploadType === 'material') {
        formData.append('type', materialType);
        await apiService.uploadMaterial(formData);
      } else {
        // For video uploads, we'll use the material upload endpoint with RECORDED_LECTURE type
        formData.append('type', 'RECORDED_LECTURE');
        await apiService.uploadMaterial(formData);
      }

      onUploadSuccess();
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCourse('');
    setSelectedFile(null);
    setTitle('');
    setMaterialType('STUDY_MATERIAL');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <Upload className="w-8 h-8 text-gray-400" />;

    if (selectedFile.type.startsWith('video/')) {
      return <Video className="w-8 h-8 text-purple-500" />;
    } else {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full py-2 px-4 rounded-md transition-colors ${
          uploadType === 'material'
            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {uploadType === 'material' ? 'Upload New Material' : 'Upload New Video'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload {uploadType === 'material' ? 'Material' : 'Video'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a course...</option>
                  {isLoadingCourses ? (
                    <option value="" disabled>Loading courses...</option>
                  ) : validCourses.length > 0 ? (
                    validCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No courses available</option>
                  )}
                </select>
              </div>

              {/* Material Type (for materials only) */}
              {uploadType === 'material' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Type *
                  </label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as 'STUDY_MATERIAL' | 'RECORDED_LECTURE')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="STUDY_MATERIAL">Study Material</option>
                    <option value="RECORDED_LECTURE">Recorded Lecture</option>
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title..."
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept={uploadType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx,.txt'}
                  />
                  <div className="flex flex-col items-center">
                    {getFileIcon()}
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedFile ? selectedFile.name : 'Click to select file'}
                    </p>
                    {selectedFile && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !selectedCourse || !title}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;