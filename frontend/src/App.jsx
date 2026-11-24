import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListingsProvider } from './context/ListingsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { HomePage } from './pages/HomePage/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage/SearchResultsPage';
import { ListingDetailPage } from './pages/ListingDetailPage/ListingDetailPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/listings" element={<SearchResultsPage />} />
              <Route path="/listings/:id" element={<ListingDetailPageWrapper />} />
              <Route path="/listing/:id" element={<ListingDetailPageWrapper />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}

function ListingDetailPageWrapper() {
  const { id } = useParams();
  return <ListingDetailPage id={decodeURIComponent(id || '')} />;
}
