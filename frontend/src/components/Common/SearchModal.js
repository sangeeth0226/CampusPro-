import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  HashtagIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock data for search suggestions
  const mockSuggestions = [
    { id: 1, type: 'page', title: 'Dashboard', path: '/', icon: AcademicCapIcon },
    { id: 2, type: 'page', title: 'Schedule', path: '/schedule', icon: ClockIcon },
    { id: 3, type: 'page', title: 'Clubs', path: '/clubs', icon: UserIcon },
    { id: 4, type: 'page', title: 'Interview Prep', path: '/interview-prep', icon: AcademicCapIcon },
    { id: 5, type: 'page', title: 'Mess & Hostel', path: '/mess-hostel', icon: BuildingOfficeIcon },
    { id: 6, type: 'action', title: 'Create New Event', action: 'create-event', icon: HashtagIcon },
    { id: 7, type: 'action', title: 'Join Club', action: 'join-club', icon: UserIcon },
  ];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        const filtered = mockSuggestions.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  const handleSelect = (item) => {
    // Save to recent searches
    const updatedRecent = [
      item,
      ...recentSearches.filter(r => r.id !== item.id)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Handle navigation
    if (item.path) {
      navigate(item.path);
      onClose();
    } else if (item.action) {
      // Handle actions
      console.log('Performing action:', item.action);
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search everything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">Searching...</span>
              </div>
            ) : query.trim() ? (
              // Search results
              results.length > 0 ? (
                <div className="py-2">
                  {results.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors duration-200"
                      >
                        <Icon className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {item.type}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                  <MagnifyingGlassIcon className="w-8 h-8 mb-2" />
                  <p>No results found for "{query}"</p>
                </div>
              )
            ) : (
              // Recent searches and suggestions
              <div className="py-2">
                {recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={`recent-${item.id}`}
                          onClick={() => handleSelect(item)}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors duration-200"
                        >
                          <ClockIcon className="w-4 h-4 text-gray-400 mr-3" />
                          <Icon className="w-4 h-4 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  </>
                )}

                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Quick Actions
                  </h3>
                </div>
                {mockSuggestions.slice(0, 5).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`suggestion-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {item.type}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Press ESC to close</span>
              <span>Use ↑↓ to navigate</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchModal;
