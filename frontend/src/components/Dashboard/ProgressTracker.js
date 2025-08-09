import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/outline';

const ProgressTracker = () => {
  const goals = [
    { name: 'Complete DS Course', progress: 75, total: 100 },
    { name: 'Interview Prep', progress: 60, total: 100 },
    { name: 'Resume Building', progress: 90, total: 100 },
  ];

  return (
    <div className="space-y-4">
      {goals.map((goal, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
            <span className="text-gray-500 dark:text-gray-400">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;
