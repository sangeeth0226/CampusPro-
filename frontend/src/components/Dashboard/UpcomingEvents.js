import React from 'react';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';

const UpcomingEvents = () => {
  const events = [
    {
      id: 1,
      title: 'Mid-term Examination',
      date: '2024-02-15',
      time: '10:00 AM',
      type: 'exam',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Tech Club Meeting',
      date: '2024-02-10',
      time: '4:00 PM',
      type: 'club',
      priority: 'medium',
    },
  ];

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <CalendarDaysIcon className="w-12 h-12 mb-4" />
        <p>No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>{event.date}</span>
            <span>{event.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingEvents;
