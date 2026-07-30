import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage';
import SubmitPage from './pages/SubmitPage';
import DetailPage from './pages/DetailPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/reports/:id" element={<DetailPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
