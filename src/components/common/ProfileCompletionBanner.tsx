import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { X, AlertCircle } from "lucide-react";

export function ProfileCompletionBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user || !isVisible) return null;

  const needsProfileCompletion = !user.profile_completed || user.trust_level === 'unverified';
  
  if (!needsProfileCompletion) return null;

  const getTargetRoute = () => {
    if (!user.profile_completed) return '/profile/complete/step1';
    if (user.trust_level === 'unverified') return '/profile/complete/step2';
    return '/profile/complete/step1';
  };

  const getBannerText = () => {
    if (!user.profile_completed) return 'Complete your profile to start renting';
    if (user.trust_level === 'unverified') return 'Submit your identity documents to verify your account';
    return 'Complete your profile to start renting';
  };

  const handleClick = () => {
    navigate(getTargetRoute());
  };

  const handleDismiss = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <div 
      className="bg-amber-50 border-b border-amber-200 px-4 py-3 cursor-pointer hover:bg-amber-100 transition-colors"
      onClick={handleClick}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            {getBannerText()} <span className="underline font-semibold">Complete now</span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-amber-200 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4 text-amber-600" />
        </button>
      </div>
    </div>
  );
}
