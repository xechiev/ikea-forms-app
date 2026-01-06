import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InstallerProfile, Job, ParsedJob, FormProgress, FormStatus, Language } from '../types';
import { parseJobText, getRequiredForms } from '../utils/parser';

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Initial form progress based on job type
const getInitialFormProgress = (jobType: string): FormProgress => {
  const requiredForms = getRequiredForms(jobType as any);
  
  return {
    startNotes: requiredForms.includes('startNotes') ? 'not_started' : 'completed',
    changeNotes: requiredForms.includes('changeNotes') ? 'not_started' : 'completed',
    kitchenArticles: requiredForms.includes('kitchenArticles') ? 'not_started' : 'completed',
    completionReport: requiredForms.includes('completionReport') ? 'not_started' : 'completed',
    wallAnchoring: requiredForms.includes('wallAnchoring') ? 'not_started' : 'completed',
    siteCondition: requiredForms.includes('siteCondition') ? 'not_started' : 'completed',
  };
};

// ==================== INSTALLER STORE ====================

interface InstallerState {
  profile: InstallerProfile | null;
  setProfile: (profile: InstallerProfile) => void;
  clearProfile: () => void;
}

export const useInstallerStore = create<InstallerState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'installer-profile',
    }
  )
);

// ==================== JOB STORE ====================

interface JobState {
  currentJob: Job | null;
  jobs: Job[];
  
  // Actions
  createJobFromText: (text: string) => ParsedJob | null;
  setCurrentJob: (job: Job | null) => void;
  saveCurrentJob: () => void;
  updateFormProgress: (formKey: keyof FormProgress, status: FormStatus) => void;
  updateFormData: (formKey: string, data: any) => void;
  clearCurrentJob: () => void;
  deleteJob: (id: string) => void;
  getJobById: (id: string) => Job | undefined;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      currentJob: null,
      jobs: [],
      
      createJobFromText: (text: string) => {
        const parsed = parseJobText(text);
        
        if (!parsed) {
          return null;
        }
        
        const job: Job = {
          ...parsed,
          id: generateId(),
          createdAt: new Date().toISOString(),
          formProgress: getInitialFormProgress(parsed.jobType),
          forms: {},
        };
        
        set({ currentJob: job });
        return parsed;
      },
      
      setCurrentJob: (job) => set({ currentJob: job }),
      
      saveCurrentJob: () => {
        const { currentJob, jobs } = get();
        if (!currentJob) return;
        
        const existingIndex = jobs.findIndex(j => j.id === currentJob.id);
        
        if (existingIndex >= 0) {
          // Update existing job
          const updatedJobs = [...jobs];
          updatedJobs[existingIndex] = currentJob;
          set({ jobs: updatedJobs });
        } else {
          // Add new job (keep last 50)
          set({ jobs: [currentJob, ...jobs].slice(0, 50) });
        }
      },
      
      updateFormProgress: (formKey, status) => {
        const { currentJob, jobs } = get();
        if (!currentJob) return;
        
        const updatedJob = {
          ...currentJob,
          formProgress: {
            ...currentJob.formProgress,
            [formKey]: status,
          },
        };
        
        // Update currentJob and save to jobs list
        const existingIndex = jobs.findIndex(j => j.id === currentJob.id);
        let updatedJobs = [...jobs];
        
        if (existingIndex >= 0) {
          updatedJobs[existingIndex] = updatedJob;
        } else {
          updatedJobs = [updatedJob, ...jobs].slice(0, 50);
        }
        
        set({
          currentJob: updatedJob,
          jobs: updatedJobs,
        });
      },
      
      updateFormData: (formKey, data) => {
        const { currentJob, jobs } = get();
        if (!currentJob) return;
        
        const updatedJob = {
          ...currentJob,
          forms: {
            ...currentJob.forms,
            [formKey]: data,
          },
        };
        
        // Update currentJob and save to jobs list
        const existingIndex = jobs.findIndex(j => j.id === currentJob.id);
        let updatedJobs = [...jobs];
        
        if (existingIndex >= 0) {
          updatedJobs[existingIndex] = updatedJob;
        } else {
          updatedJobs = [updatedJob, ...jobs].slice(0, 50);
        }
        
        set({
          currentJob: updatedJob,
          jobs: updatedJobs,
        });
      },
      
      clearCurrentJob: () => set({ currentJob: null }),
      
      deleteJob: (id) => {
        const { jobs, currentJob } = get();
        set({
          jobs: jobs.filter(j => j.id !== id),
          currentJob: currentJob?.id === id ? null : currentJob,
        });
      },
      
      getJobById: (id) => {
        const { jobs } = get();
        return jobs.find(j => j.id === id);
      },
    }),
    {
      name: 'jobs-storage',
    }
  )
);

// ==================== APP SETTINGS STORE ====================

interface AppSettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-settings',
    }
  )
);
