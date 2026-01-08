import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../store';
import { getRequiredForms, getFormDisplayName } from '../utils/parser';
import Header from '../components/common/Header';
import type { FormStatus } from '../types';

export function JobPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, saveCurrentJob } = useJobStore();

  if (!currentJob) {
    navigate('/');
    return null;
  }

  const requiredForms = getRequiredForms(currentJob.jobType);

  const getStatusBadgeClass = (status: FormStatus) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in-progress';
      default:
        return 'status-not-started';
    }
  };

  const handleFormClick = (formKey: string) => {
    navigate(`/form/${formKey}`);
  };

  const handleSaveJob = () => {
    saveCurrentJob();
    navigate('/');
  };

  const lang = i18n.language as 'en' | 'ru';

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={currentJob.customer.name} showBack />
      
      <main className="p-4 max-w-lg mx-auto">
        {/* Job Info */}
        <section className="form-section">
          <div className="flex items-start justify-between mb-4">
            <span className={`status-badge ${
              currentJob.jobType === 'installation' ? 'bg-blue-100 text-blue-800' :
              currentJob.jobType === 'wo' ? 'bg-orange-100 text-orange-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {t(`job.type.${currentJob.jobType}`)}
            </span>
            
            {currentJob.status === 'confirmed' && (
              <span className="status-badge bg-green-100 text-green-800">
                ✓ Confirmed
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">{t('job.customer')}</span>
              <p className="font-medium">{currentJob.customer.name}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-500">{t('job.address')}</span>
              <p className="font-medium">{currentJob.address || '—'}</p>
            </div>
            
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-500">{t('job.phone')}</span>
                <p className="font-medium">
                  {currentJob.customer.phone ? (
                    <a 
                      href={`tel:${currentJob.customer.phone}`}
                      className="text-ikea-blue underline"
                    >
                      {currentJob.customer.phone}
                    </a>
                  ) : '—'}
                </p>
              </div>
              
              {currentJob.region && (
                <div>
                  <span className="text-sm text-gray-500">Region</span>
                  <p className="font-medium">{currentJob.region}</p>
                </div>
              )}
            </div>
            
            {(currentJob.date || currentJob.time) && (
              <div>
                <span className="text-sm text-gray-500">{t('job.date')}</span>
                <p className="font-medium">
                  {currentJob.date}
                  {currentJob.time && ` • ${currentJob.time}`}
                </p>
              </div>
            )}
            
            {currentJob.notes && (
              <div>
                <span className="text-sm text-gray-500">{t('job.notes')}</span>
                <p className="font-medium text-gray-700">{currentJob.notes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Required Forms */}
        <section className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('job.requiredForms')}
          </h3>
          
          <div className="space-y-3">
            {requiredForms.map((formKey) => {
              const status = currentJob.formProgress[formKey as keyof typeof currentJob.formProgress];
              
              return (
                <button
                  key={formKey}
                  onClick={() => handleFormClick(formKey)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm text-left hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    {status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : status === 'in_progress' ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    
                    <span className="font-medium">
                      {getFormDisplayName(formKey, lang)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                      {t(`forms.status.${status}`)}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleSaveJob}
            className="btn-primary w-full"
          >
            {t('actions.save')}
          </button>
        </div>
      </main>
    </div>
  );
}

export default JobPage;
