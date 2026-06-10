import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { phoneSchema } from "@/utils/validators";
import authService from "@/services/auth.service";
import toast from "react-hot-toast";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  phone_number: string;
};

export default function SignupPhone() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(phoneSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.requestOtp(data.phone_number, 'signup');
      toast.success('OTP sent successfully!');
      navigate('/auth/signup/otp', { state: { phone_number: data.phone_number } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      const fieldErrors = error.response?.data?.data;
      
      if (fieldErrors?.phone_number) {
        toast.error(fieldErrors.phone_number[0]);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Enter your phone number to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Number Input */}
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
              <p className="mt-2 text-xs text-gray-500">
                We'll send a 6-digit OTP to this number
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/auth/login" 
                className="font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in
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
