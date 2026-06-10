import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth.service";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");

  if (!user) return null;

  const onSaveName = async () => {
    setIsSaving(true);
    try {
      const updated = await authService.updateFullName(fullName);
      setUser(updated);
      toast.success("Name updated successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update name";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-600">Phone</p>
              <p className="text-sm text-gray-900">{user.phone_number}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Trust level</p>
              <p className="text-sm text-gray-900">{user.trust_level}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Profile completed</p>
              <p className="text-sm text-gray-900">{user.profile_completed ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Verification status</p>
              <p className="text-sm text-gray-900">
                {user.is_approved === true
                  ? "Approved"
                  : user.is_approved === false
                    ? "Rejected"
                    : "Pending / Not submitted"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Full name
            </label>
            <div className="flex gap-2">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Your full name"
              />
              <button
                type="button"
                onClick={onSaveName}
                disabled={isSaving}
                className="rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Name change may be restricted after completed transactions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

