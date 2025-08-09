import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

const ClubsPreview = () => {
  const clubs = [
    { id: 1, name: 'Tech Innovation Club', members: 45, role: 'Member' },
    { id: 2, name: 'Cultural Society', members: 32, role: 'Admin' },
    { id: 3, name: 'Sports Club', members: 28, role: 'Member' },
  ];

  return (
    <div className="space-y-3">
      {clubs.map((club) => (
        <div key={club.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{club.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{club.members} members</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
            {club.role}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ClubsPreview;
