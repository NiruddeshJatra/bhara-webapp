import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { signupDetailsSchema } from "@/utils/validators";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";
import authService from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  full_name: string;
  password: string;
  confirm_password: string;
  marketing_consent: boolean;
};

export default function SignupDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const ephemeralToken = location.state?.ephemeral_token;

  // Guard: Redirect if no ephemeral token in state
  useEffect(() => {
    if (!ephemeralToken) {
      navigate("/auth/signup", { replace: true });
    }
  }, [ephemeralToken, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: {
      marketing_consent: false,
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await authService.signupComplete(ephemeralToken, {
        full_name: data.full_name,
        password: data.password,
        marketing_consent: data.marketing_consent,
      });

      // Login user and redirect
      login(response.access_token, response.user);
      toast.success('Account created successfully!');
      
      // Show persistent banner if profile not completed
      if (!response.user.profile_completed) {
        toast("Complete your profile to start renting", { duration: 5000 });
      }
      
      navigate('/advertisements');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      const fieldErrors = error.response?.data?.data;
      
      if (fieldErrors) {
        // Handle field-specific errors
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!ephemeralToken) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Almost There!</h1>
              <p className="text-gray-600">Set up your account details</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("full_name")}
                    type="text"
                    id="full_name"
                    placeholder="Your full name"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.full_name ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Create a password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
                <PasswordStrengthBar password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("confirm_password")}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.confirm_password ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Marketing Consent */}
              <div className="flex items-start">
                <input
                  {...register("marketing_consent")}
                  type="checkbox"
                  id="marketing_consent"
                  className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={isLoading}
                />
                <label htmlFor="marketing_consent" className="ml-2 text-sm text-gray-600">
                  I'd like to receive updates and offers from Bhara
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
