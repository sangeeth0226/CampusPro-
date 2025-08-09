import React from 'react';

const MessPreview = () => {
  const todayMenu = {
    breakfast: ['Poha', 'Tea/Coffee', 'Banana'],
    lunch: ['Rice', 'Dal', 'Sabzi', 'Roti', 'Pickle'],
    dinner: ['Roti', 'Rice', 'Dal', 'Paneer Sabzi', 'Salad']
  };

  return (
    <div className="space-y-3">
      {Object.entries(todayMenu).map(([meal, items]) => (
        <div key={meal} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">{meal}</h4>
          <div className="flex flex-wrap gap-1">
            {items.map((item, index) => (
              <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessPreview;
