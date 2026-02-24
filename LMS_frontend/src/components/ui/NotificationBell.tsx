import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Notice } from '../../types/api';
import apiService from '../../services/api';

interface NotificationBellProps {
  onNoticeClick?: (notice: Notice) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onNoticeClick }) => {
  const [notifications, setNotifications] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotices();
      const allNotices = response.notices;
      setNotifications(allNotices.slice(0, 10)); // Show latest 10 notifications

      // Count unread notifications (in a real app, you'd track this in localStorage or backend)
      const unread = allNotices.filter(notice => {
        const readNotices = JSON.parse(localStorage.getItem('readNotices') || '[]');
        return !readNotices.includes(notice.id);
      }).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (noticeId: string) => {
    const readNotices = JSON.parse(localStorage.getItem('readNotices') || '[]');
    if (!readNotices.includes(noticeId)) {
      readNotices.push(noticeId);
      localStorage.setItem('readNotices', JSON.stringify(readNotices));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const allNoticeIds = notifications.map(n => n.id);
    localStorage.setItem('readNotices', JSON.stringify(allNoticeIds));
    setUnreadCount(0);
  };

  const handleNoticeClick = (notice: Notice) => {
    markAsRead(notice.id);
    setIsOpen(false);
    if (onNoticeClick) {
      onNoticeClick(notice);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notice) => {
                const readNotices = JSON.parse(localStorage.getItem('readNotices') || '[]');
                const isRead = readNotices.includes(notice.id);

                return (
                  <div
                    key={notice.id}
                    onClick={() => handleNoticeClick(notice)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      !isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-medium ${!isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notice.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notice.body}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>{formatTimeAgo(notice.createdAt)}</span>
                          {notice.courseId && (
                            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Course Notice
                            </span>
                          )}
                          {!notice.courseId && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                              General Notice
                            </span>
                          )}
                        </div>
                      </div>
                      {!isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;