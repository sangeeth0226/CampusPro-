import { createSlice } from '@reduxjs/toolkit';

// Get theme from localStorage or system preference
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const initialState = {
  // Theme
  theme: getInitialTheme(),
  
  // Navigation
  sidebarOpen: false,
  sidebarCollapsed: false,
  
  // Mobile
  isMobile: false,
  
  // Modals
  modals: {
    profileModal: false,
    settingsModal: false,
    notificationsModal: false,
    createEventModal: false,
    joinClubModal: false,
    interviewSessionModal: false,
  },
  
  // Loading states
  loading: {
    global: false,
    page: false,
    component: {},
  },
  
  // Notifications
  notifications: [],
  
  // Search
  globalSearchOpen: false,
  
  // Dashboard
  dashboardLayout: 'grid', // 'grid' or 'list'
  dashboardWidgets: [
    { id: 'schedule', visible: true, order: 1 },
    { id: 'deadlines', visible: true, order: 2 },
    { id: 'notifications', visible: true, order: 3 },
    { id: 'clubs', visible: true, order: 4 },
    { id: 'mess', visible: true, order: 5 },
    { id: 'progress', visible: true, order: 6 },
  ],
  
  // Form states
  forms: {
    errors: {},
    touched: {},
    submitting: {},
  },
  
  // Page states
  currentPage: '',
  breadcrumbs: [],
  
  // Filters and sorts
  filters: {
    clubs: {
      category: '',
      search: '',
      sortBy: 'members',
      sortOrder: 'desc',
    },
    schedule: {
      view: 'week', // 'day', 'week', 'month'
      filterType: 'all',
    },
    interview: {
      category: 'all',
      difficulty: 'all',
    },
  },
  
  // Settings
  settings: {
    compactMode: false,
    showAnimations: true,
    autoSave: true,
    notificationSound: true,
    emailNotifications: true,
    pushNotifications: true,
  },
  
  // Tour/Help
  showTour: false,
  tourStep: 0,
  helpOpen: false,
  
  // Performance
  lastInteraction: Date.now(),
  pageLoadTime: null,
  
  // Accessibility
  highContrast: false,
  fontSize: 'medium', // 'small', 'medium', 'large'
  keyboardNavigation: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // Apply theme to document
      if (typeof document !== 'undefined') {
        if (action.payload === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
      
      if (typeof document !== 'undefined') {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    
    // Navigation actions
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    
    // Modal actions
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      state.modals[modalName] = data || true;
    },
    
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.component[component] = loading;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    
    // Search actions
    setGlobalSearchOpen: (state, action) => {
      state.globalSearchOpen = action.payload;
    },
    
    // Dashboard actions
    setDashboardLayout: (state, action) => {
      state.dashboardLayout = action.payload;
    },
    
    updateDashboardWidgets: (state, action) => {
      state.dashboardWidgets = action.payload;
    },
    
    toggleWidget: (state, action) => {
      const widget = state.dashboardWidgets.find(w => w.id === action.payload);
      if (widget) {
        widget.visible = !widget.visible;
      }
    },
    
    // Form actions
    setFormError: (state, action) => {
      const { form, field, error } = action.payload;
      if (!state.forms.errors[form]) {
        state.forms.errors[form] = {};
      }
      state.forms.errors[form][field] = error;
    },
    
    clearFormErrors: (state, action) => {
      if (action.payload) {
        delete state.forms.errors[action.payload];
      } else {
        state.forms.errors = {};
      }
    },
    
    setFieldTouched: (state, action) => {
      const { form, field } = action.payload;
      if (!state.forms.touched[form]) {
        state.forms.touched[form] = {};
      }
      state.forms.touched[form][field] = true;
    },
    
    setFormSubmitting: (state, action) => {
      const { form, submitting } = action.payload;
      state.forms.submitting[form] = submitting;
    },
    
    // Page actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    // Filter actions
    setFilter: (state, action) => {
      const { section, key, value } = action.payload;
      if (state.filters[section]) {
        state.filters[section][key] = value;
      }
    },
    
    resetFilters: (state, action) => {
      const section = action.payload;
      if (state.filters[section]) {
        // Reset to default values based on section
        switch (section) {
          case 'clubs':
            state.filters.clubs = {
              category: '',
              search: '',
              sortBy: 'members',
              sortOrder: 'desc',
            };
            break;
          case 'schedule':
            state.filters.schedule = {
              view: 'week',
              filterType: 'all',
            };
            break;
          case 'interview':
            state.filters.interview = {
              category: 'all',
              difficulty: 'all',
            };
            break;
        }
      }
    },
    
    // Settings actions
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    // Tour actions
    setShowTour: (state, action) => {
      state.showTour = action.payload;
    },
    
    setTourStep: (state, action) => {
      state.tourStep = action.payload;
    },
    
    setHelpOpen: (state, action) => {
      state.helpOpen = action.payload;
    },
    
    // Performance actions
    updateLastInteraction: (state) => {
      state.lastInteraction = Date.now();
    },
    
    setPageLoadTime: (state, action) => {
      state.pageLoadTime = action.payload;
    },
    
    // Accessibility actions
    setHighContrast: (state, action) => {
      state.highContrast = action.payload;
    },
    
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    
    setKeyboardNavigation: (state, action) => {
      state.keyboardNavigation = action.payload;
    },
  },
});

// Action creators
export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setIsMobile,
  openModal,
  closeModal,
  closeAllModals,
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  setGlobalSearchOpen,
  setDashboardLayout,
  updateDashboardWidgets,
  toggleWidget,
  setFormError,
  clearFormErrors,
  setFieldTouched,
  setFormSubmitting,
  setCurrentPage,
  setBreadcrumbs,
  setFilter,
  resetFilters,
  updateSettings,
  setShowTour,
  setTourStep,
  setHelpOpen,
  updateLastInteraction,
  setPageLoadTime,
  setHighContrast,
  setFontSize,
  setKeyboardNavigation,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectIsMobile = (state) => state.ui.isMobile;
export const selectModals = (state) => state.ui.modals;
export const selectLoading = (state) => state.ui.loading;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectGlobalSearchOpen = (state) => state.ui.globalSearchOpen;
export const selectDashboardLayout = (state) => state.ui.dashboardLayout;
export const selectDashboardWidgets = (state) => state.ui.dashboardWidgets;
export const selectVisibleWidgets = (state) => 
  state.ui.dashboardWidgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
export const selectFormErrors = (state) => state.ui.forms.errors;
export const selectFormTouched = (state) => state.ui.forms.touched;
export const selectFormSubmitting = (state) => state.ui.forms.submitting;
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectFilters = (state) => state.ui.filters;
export const selectSettings = (state) => state.ui.settings;
export const selectShowTour = (state) => state.ui.showTour;
export const selectTourStep = (state) => state.ui.tourStep;
export const selectHelpOpen = (state) => state.ui.helpOpen;

export default uiSlice.reducer;

