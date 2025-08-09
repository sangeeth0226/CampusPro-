import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotifications } from '../../store/slices/uiSlice';

const NotificationsPreview = () => {
  const notifications = useSelector(selectNotifications);
  const recentNotifications = notifications.slice(0, 3);

  if (recentNotifications.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>No recent notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentNotifications.map((notification) => (
        <div key={notification.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPreview;
