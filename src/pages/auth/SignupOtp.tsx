import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { otpSchema } from "@/utils/validators";
import { OtpInput } from "@/components/auth/OtpInput";
import authService from "@/services/auth.service";
import toast from "react-hot-toast";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  otp: string;
};

export default function SignupOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = location.state?.phone_number;

  // Guard: Redirect if no phone number in state
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/auth/signup');
    }
  }, [phoneNumber, navigate]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch('otp', '');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (!canResend || !phoneNumber) return;

    try {
      await authService.requestOtp(phoneNumber, 'signup');
      toast.success('OTP resent successfully!');
      setResendTimer(300);
      setCanResend(false);
      setValue('otp', ''); // Clear OTP input
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      const ephemeralToken = await authService.verifyOtp(phoneNumber, data.otp, 'signup');
      toast.success('OTP verified successfully!');
      navigate('/auth/signup/details', { state: { ephemeral_token: ephemeralToken } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      toast.error(errorMessage);
      setValue('otp', ''); // Clear OTP input on error
    } finally {
      setIsLoading(false);
    }
  };

  if (!phoneNumber) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Number</h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* OTP Input */}
            <div>
              <OtpInput 
                value={otpValue} 
                onChange={(value) => setValue('otp', value)}
              />
              {errors.otp && (
                <p className="mt-2 text-xs text-red-500 text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            {/* Resend Timer */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Resend OTP in {formatTime(resendTimer)}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otpValue.length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/auth/signup" 
              className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              &larr; Change number
            </Link>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
