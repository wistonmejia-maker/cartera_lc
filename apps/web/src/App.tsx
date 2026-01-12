import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PortfolioPage } from './pages/Portfolio';
import { UploadReportPage } from './pages/UploadReport';
import { LettersPage } from './pages/LettersPage';
import { LetterHistoryPage } from './pages/LetterHistoryPage';
import { LegalPage } from './pages/LegalPage';
import { SettingsPage } from './pages/SettingsPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { MigrationPage } from './pages/MigrationPage';
import { usePropertyStore } from './stores/usePropertyStore';

function App() {
  const fetchProperties = usePropertyStore(s => s.fetchProperties);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="upload" element={<UploadReportPage />} />
          <Route path="letters" element={<LettersPage />} />
          <Route path="letters/history" element={<LetterHistoryPage />} />
          <Route path="legal" element={<LegalPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="migrate" element={<MigrationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
