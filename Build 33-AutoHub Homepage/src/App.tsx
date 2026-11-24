import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ListingsProvider } from "@/context/ListingsContext";
import { SavedSearchesProvider } from "@/context/SavedSearchesContext";
import { BlockedUsersProvider } from "@/context/BlockedUsersContext";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { SellerProfilePage } from "@/pages/SellerProfilePage";
import { VerificationPage } from "@/pages/VerificationPage";
import { settingsTabs, type SettingsTab } from "@/components/settings/SettingsShell";
import { OverviewPage } from "@/pages/dashboard/OverviewPage";
import { MyListingsPage } from "@/pages/dashboard/MyListingsPage";
import { FavoritesPage } from "@/pages/dashboard/FavoritesPage";
import { SavedSearchesPage } from "@/pages/dashboard/SavedSearchesPage";
import { DesignSystemPage } from "@/pages/DesignSystemPage";
import { HomePage } from "@/pages/HomePage";
import { ListingDetailPage } from "@/pages/ListingDetailPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { SearchResultsPage } from "@/pages/SearchResultsPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "@/pages/auth/VerifyEmailPage";

const protectedPlaceholders: Record<string, string> = {
  "/messages": "Messages",
  "/sell": "Post a listing",
};

const dashboardPages: Record<string, () => React.ReactElement | null> = {
  "/dashboard": OverviewPage,
  "/dashboard/listings": MyListingsPage,
  "/dashboard/favorites": FavoritesPage,
  "/dashboard/searches": SavedSearchesPage,
};

const authPages: Record<string, () => React.ReactElement> = {
  "/login": LoginPage,
  "/register": RegisterPage,
  "/forgot-password": ForgotPasswordPage,
  "/reset-password": ResetPasswordPage,
  "/verify-email": VerifyEmailPage,
};

function Routes() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (authPages[path]) {
    const Page = authPages[path];
    return <Page />;
  }
  if (path === "/design-system") return <DesignSystemPage />;
  if (path === "/search") return <SearchResultsPage />;
  if (dashboardPages[path]) {
    const Page = dashboardPages[path];
    return (
      <ProtectedRoute>
        <Page />
      </ProtectedRoute>
    );
  }
  if (protectedPlaceholders[path])
    return (
      <ProtectedRoute>
        <PlaceholderPage title={protectedPlaceholders[path]} />
      </ProtectedRoute>
    );
  if (/^\/listing\/[^/]+\/edit$/.test(path))
    return (
      <ProtectedRoute>
        <PlaceholderPage title="Edit listing" />
      </ProtectedRoute>
    );
  const listingMatch = path.match(/^\/listing\/([^/]+)$/);
  if (listingMatch) return <ListingDetailPage id={decodeURIComponent(listingMatch[1])} />;
  if (path === "/settings") {
    window.location.replace("/settings/profile");
    return null;
  }
  const settingsMatch = path.match(/^\/settings\/([^/]+)$/);
  if (settingsMatch && settingsTabs.some((tab) => tab.id === settingsMatch[1]))
    return (
      <ProtectedRoute>
        <SettingsPage tab={settingsMatch[1] as SettingsTab} />
      </ProtectedRoute>
    );
  if (path === "/verification")
    return (
      <ProtectedRoute>
        <VerificationPage />
      </ProtectedRoute>
    );
  const sellerMatch = path.match(/^\/seller\/([^/]+)$/);
  if (sellerMatch) return <SellerProfilePage id={decodeURIComponent(sellerMatch[1])} />;
  return <HomePage />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ListingsProvider>
          <FavoritesProvider>
            <SavedSearchesProvider>
              <BlockedUsersProvider>
                <Routes />
              </BlockedUsersProvider>
            </SavedSearchesProvider>
          </FavoritesProvider>
        </ListingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
