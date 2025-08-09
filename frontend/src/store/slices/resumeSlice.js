import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  resume: {
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
    references: [],
  },
  templates: [
    { id: 'modern', name: 'Modern', preview: '/templates/modern.png' },
    { id: 'classic', name: 'Classic', preview: '/templates/classic.png' },
    { id: 'creative', name: 'Creative', preview: '/templates/creative.png' },
    { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.png' },
  ],
  selectedTemplate: 'modern',
  loading: false,
  error: null,
  aiSuggestions: [],
  aiLoading: false,
  lastSaved: null,
  isDirty: false,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setResume: (state, action) => {
      state.resume = action.payload;
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    updatePersonalInfo: (state, action) => {
      state.resume.personalInfo = { ...state.resume.personalInfo, ...action.payload };
      state.isDirty = true;
    },
    addEducation: (state, action) => {
      state.resume.education.push({
        id: Date.now().toString(),
        ...action.payload,
      });
      state.isDirty = true;
    },
    updateEducation: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.resume.education.findIndex(item => item.id === id);
      if (index !== -1) {
        state.resume.education[index] = { ...state.resume.education[index], ...updates };
        state.isDirty = true;
      }
    },
    deleteEducation: (state, action) => {
      state.resume.education = state.resume.education.filter(item => item.id !== action.payload);
      state.isDirty = true;
    },
    addExperience: (state, action) => {
      state.resume.experience.push({
        id: Date.now().toString(),
        ...action.payload,
      });
      state.isDirty = true;
    },
    updateExperience: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.resume.experience.findIndex(item => item.id === id);
      if (index !== -1) {
        state.resume.experience[index] = { ...state.resume.experience[index], ...updates };
        state.isDirty = true;
      }
    },
    deleteExperience: (state, action) => {
      state.resume.experience = state.resume.experience.filter(item => item.id !== action.payload);
      state.isDirty = true;
    },
    addProject: (state, action) => {
      state.resume.projects.push({
        id: Date.now().toString(),
        ...action.payload,
      });
      state.isDirty = true;
    },
    updateProject: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.resume.projects.findIndex(item => item.id === id);
      if (index !== -1) {
        state.resume.projects[index] = { ...state.resume.projects[index], ...updates };
        state.isDirty = true;
      }
    },
    deleteProject: (state, action) => {
      state.resume.projects = state.resume.projects.filter(item => item.id !== action.payload);
      state.isDirty = true;
    },
    updateSkills: (state, action) => {
      state.resume.skills = action.payload;
      state.isDirty = true;
    },
    addSkill: (state, action) => {
      state.resume.skills.push(action.payload);
      state.isDirty = true;
    },
    removeSkill: (state, action) => {
      state.resume.skills = state.resume.skills.filter(skill => skill !== action.payload);
      state.isDirty = true;
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
      state.isDirty = true;
    },
    setAiLoading: (state, action) => {
      state.aiLoading = action.payload;
    },
    setAiSuggestions: (state, action) => {
      state.aiSuggestions = action.payload;
    },
    applySuggestion: (state, action) => {
      const { type, field, value } = action.payload;
      
      switch (type) {
        case 'personalInfo':
          state.resume.personalInfo[field] = value;
          break;
        case 'summary':
          state.resume.personalInfo.summary = value;
          break;
        case 'skills':
          state.resume.skills = [...new Set([...state.resume.skills, ...value])];
          break;
        default:
          break;
      }
      
      state.isDirty = true;
    },
    markAsSaved: (state) => {
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setResume,
  updatePersonalInfo,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addProject,
  updateProject,
  deleteProject,
  updateSkills,
  addSkill,
  removeSkill,
  setSelectedTemplate,
  setAiLoading,
  setAiSuggestions,
  applySuggestion,
  markAsSaved,
  clearError,
} = resumeSlice.actions;

export const selectResume = (state) => state.resume.resume;
export const selectPersonalInfo = (state) => state.resume.resume.personalInfo;
export const selectEducation = (state) => state.resume.resume.education;
export const selectExperience = (state) => state.resume.resume.experience;
export const selectProjects = (state) => state.resume.resume.projects;
export const selectSkills = (state) => state.resume.resume.skills;
export const selectTemplates = (state) => state.resume.templates;
export const selectSelectedTemplate = (state) => state.resume.selectedTemplate;
export const selectResumeLoading = (state) => state.resume.loading;
export const selectResumeError = (state) => state.resume.error;
export const selectAiSuggestions = (state) => state.resume.aiSuggestions;
export const selectAiLoading = (state) => state.resume.aiLoading;
export const selectIsDirty = (state) => state.resume.isDirty;
export const selectLastSaved = (state) => state.resume.lastSaved;

export default resumeSlice.reducer;
