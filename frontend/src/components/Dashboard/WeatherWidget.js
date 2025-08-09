import React from 'react';
import { SunIcon } from '@heroicons/react/24/outline';

const WeatherWidget = () => {
  // Mock weather data
  const weather = {
    temperature: 24,
    condition: 'Sunny',
    location: 'Campus',
    humidity: 65,
    windSpeed: 12
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-3">
        <SunIcon className="w-12 h-12 text-yellow-500" />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{weather.temperature}°C</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{weather.condition}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{weather.location}</p>
      </div>
    </div>
  );
};

export default WeatherWidget;
