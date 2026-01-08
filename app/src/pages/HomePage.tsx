import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  
  const { createJobFromText, jobs } = useJobStore();
  const { profile } = useInstallerStore();

  // Check if profile is set
  const needsProfile = !profile?.name;

  const handleCreateJob = () => {
    if (!inputText.trim()) {
      return;
    }

    setError('');
    const parsed = createJobFromText(inputText);
    
    if (!parsed) {
      setError(t('errors.parseError'));
      return;
    }

    // Navigate to job view
    navigate('/job');
  };

  const handleJobClick = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      useJobStore.getState().setCurrentJob(job);
      navigate('/job');
    }
  };

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="p-4 max-w-lg mx-auto">
        {/* Welcome message */}
        {profile?.name && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {t('home.welcome')}, {profile.name}!
            </h2>
          </div>
        )}

        {/* Profile setup prompt */}
        {needsProfile && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-800 mb-3">
              Please set up your installer profile first.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="btn-primary w-full"
            >
              {t('nav.settings')}
            </button>
          </div>
        )}

        {/* Job input section */}
        <section className="form-section">
          <h3 className="font-medium text-gray-700 mb-3">
            {t('home.pasteInstructions')}
          </h3>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('home.placeholder')}
            className="input-field min-h-[160px] resize-none"
            disabled={needsProfile}
          />
          
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
          
          <button
            onClick={handleCreateJob}
            disabled={!inputText.trim() || needsProfile}
            className="btn-yellow w-full mt-4"
          >
            {t('home.createJob')}
          </button>
        </section>

        {/* Recent jobs */}
        {recentJobs.length > 0 && (
          <section className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">
              {t('home.recentJobs')}
            </h3>
            
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm text-left hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {job.customer.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.address}
                      </p>
                    </div>
                    <span className={`status-badge ${
                      job.jobType === 'installation' ? 'bg-blue-100 text-blue-800' :
                      job.jobType === 'wo' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {t(`job.type.${job.jobType}`)}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-3 text-xs text-gray-400">
                    <span>{job.date}</span>
                    {job.time && <span className="ml-2">{job.time}</span>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {jobs.length === 0 && !needsProfile && (
          <p className="text-center text-gray-500 mt-8">
            {t('home.noJobs')}
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default HomePage;
