import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n';
import HomePage from './pages/HomePage';
import JobPage from './pages/JobPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ChangeNotesPage from './pages/ChangeNotesPage';
import CompletionReportPage from './pages/CompletionReportPage';
import StartNotesPage from './pages/StartNotesPage';
import KitchenArticlesPage from './pages/KitchenArticlesPage';
import SiteConditionPage from './pages/SiteConditionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/job" element={<JobPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/form/changeNotes" element={<ChangeNotesPage />} />
        <Route path="/form/completionReport" element={<CompletionReportPage />} />
        <Route path="/form/startNotes" element={<StartNotesPage />} />
        <Route path="/form/kitchenArticles" element={<KitchenArticlesPage />} />
        <Route path="/form/siteCondition" element={<SiteConditionPage />} />
        <Route path="/form/wallAnchoring" element={<div className="p-4">Wall Anchoring - Coming soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
