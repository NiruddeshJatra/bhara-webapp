import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/utils/validators";
import authService from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  phone_number: string;
  password: string;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.phone_number, data.password);
      
      // Login user and redirect
      login(response.access_token, response.user);
      toast.success('Login successful!');
      
      // Show persistent banner if profile not completed
      if (!response.user.profile_completed) {
        toast("Complete your profile to start renting", { duration: 5000 });
      }
      
      navigate('/advertisements');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      const fieldErrors = error.response?.data?.data;
      
      if (fieldErrors?.detail) {
        toast.error(fieldErrors.detail);
      } else if (fieldErrors?.phone_number) {
        toast.error(fieldErrors.phone_number[0]);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20 relative overflow-hidden">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-lime-400 rounded-full blur-3xl opacity-30 animate-pulse delay-100" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-300 rounded-full blur-2xl opacity-20 animate-pulse delay-200" />

        <div className="max-w-md w-full relative z-10">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your Bhara account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('phone_number')}
                  type="tel"
                  id="phone_number"
                  placeholder="01XXXXXXXXX"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.phone_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone_number && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link 
                to="/auth/forgot-password" 
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
