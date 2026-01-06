import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInstallerStore, useAppSettingsStore } from '../store';
import Header from '../components/common/Header';
import BottomNav from '../components/common/BottomNav';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { profile, setProfile } = useInstallerStore();
  const { language, setLanguage } = useAppSettingsStore();
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.company || 'Phoenix NY Inc.');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setCompany(profile.company);
    }
  }, [profile]);

  const handleSaveProfile = () => {
    setProfile({
      name: name.trim(),
      phone: phone.trim(),
      company: company.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLanguageChange = (lang: 'en' | 'ru') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const isValidProfile = name.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={t('settings.title')} />
      
      <main className="p-4 max-w-lg mx-auto">
        {/* Installer Profile */}
        <section className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('settings.installerProfile')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">
                {t('settings.name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Smith"
              />
            </div>
            
            <div>
              <label className="form-label">
                {t('settings.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="1234567890"
              />
            </div>
            
            <div>
              <label className="form-label">
                {t('settings.company')}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-field"
                placeholder="Phoenix NY Inc."
              />
            </div>
          </div>
          
          <button
            onClick={handleSaveProfile}
            disabled={!isValidProfile}
            className="btn-primary w-full mt-6"
          >
            {t('settings.saveProfile')}
          </button>
          
          {saved && (
            <p className="text-green-600 text-center mt-3">
              ✓ {t('settings.profileSaved')}
            </p>
          )}
        </section>

        {/* Language Settings */}
        <section className="form-section mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('settings.language')}
          </h3>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                language === 'en'
                  ? 'border-ikea-blue bg-blue-50 text-ikea-blue'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              🇺🇸 {t('settings.english')}
            </button>
            
            <button
              onClick={() => handleLanguageChange('ru')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                language === 'ru'
                  ? 'border-ikea-blue bg-blue-50 text-ikea-blue'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              🇷🇺 {t('settings.russian')}
            </button>
          </div>
        </section>

        {/* App Info */}
        <section className="mt-8 text-center text-gray-400 text-sm">
          <p>IKEA Forms Manager v1.0</p>
          <p className="mt-1">Phoenix NY Inc.</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

export default SettingsPage;
