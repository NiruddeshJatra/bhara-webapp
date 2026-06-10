import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white">
            B
          </span>
          Bhara
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="hidden text-gray-600 sm:inline">
                {user?.full_name ?? "Account"}
              </span>
              <Link
                to="/profile/complete/step1"
                className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign in
              </Link>
              <Link
                to="/auth/signup"
                className="rounded-lg bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-700"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

