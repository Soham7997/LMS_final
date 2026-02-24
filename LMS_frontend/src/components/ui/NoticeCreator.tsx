import React, { useState, useEffect } from 'react';
import { Bell, Loader2, Plus, Globe, BookOpen } from 'lucide-react';
import { Course } from '../../types/api';
import apiService from '../../services/api';

interface NoticeCreatorProps {
  courses: Course[];
  onNoticeCreated: () => void;
}

const NoticeCreator: React.FC<NoticeCreatorProps> = ({ courses, onNoticeCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    body: '',
    isGeneral: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const noticeData = {
        title: formData.title,
        body: formData.body,
        ...(formData.isGeneral ? {} : { courseId: formData.courseId })
      };

      await apiService.createNotice(noticeData);
      onNoticeCreated();
      handleClose();
    } catch (error) {
      console.error('Failed to create notice:', error);
      setError(error instanceof Error ? error.message : 'Failed to create notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      courseId: '',
      title: '',
      body: '',
      isGeneral: true
    });
    setError('');
  };

  const handleTypeChange = (isGeneral: boolean) => {
    setFormData({
      ...formData,
      isGeneral,
      courseId: isGeneral ? '' : formData.courseId
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Notice
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Notice</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isGeneral}
                      onChange={() => handleTypeChange(true)}
                      className="mr-2"
                    />
                    <Globe className="w-4 h-4 mr-1" />
                    General Notice
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isGeneral}
                      onChange={() => handleTypeChange(false)}
                      className="mr-2"
                    />
                    <BookOpen className="w-4 h-4 mr-1" />
                    Course Notice
                  </label>
                </div>
              </div>

              {/* Course Selection (only for course notices) */}
              {!formData.isGeneral && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Course *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.isGeneral}
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notice title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notice content..."
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
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!formData.isGeneral && !formData.courseId)}
                  className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Notice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NoticeCreator;