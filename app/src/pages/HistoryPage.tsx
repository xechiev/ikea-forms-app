import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../store';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';

export function HistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { jobs, setCurrentJob, deleteJob } = useJobStore();

  const handleJobClick = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setCurrentJob(job);
      navigate('/job');
    }
  };

  const handleDeleteJob = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (window.confirm(t('alerts.deleteConfirm'))) {
      deleteJob(jobId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={t('nav.history')} />
      
      <main className="p-4 max-w-lg mx-auto">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mt-4">{t('home.noJobs')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job.id)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {job.customer.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {job.address || '—'}
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2 ml-3">
                    <span className={`status-badge ${
                      job.jobType === 'installation' ? 'bg-blue-100 text-blue-800' :
                      job.jobType === 'wo' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {t(`job.type.${job.jobType}`)}
                    </span>
                    
                    <button
                      onClick={(e) => handleDeleteJob(e, job.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete job"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-3 flex gap-1">
                  {Object.entries(job.formProgress).map(([key, status]) => {
                    if (status === 'completed') return null; // Skip non-required forms
                    return (
                      <div
                        key={key}
                        className={`h-1.5 flex-1 rounded-full ${
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-yellow-500' :
                          'bg-gray-200'
                        }`}
                        title={key}
                      />
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>{job.date || formatDate(job.createdAt)}</span>
                  {job.region && <span>{job.region}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default HistoryPage;
