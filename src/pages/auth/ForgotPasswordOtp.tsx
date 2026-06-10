import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { otpSchema } from "@/utils/validators";
import { OtpInput } from "@/components/auth/OtpInput";
import authService from "@/services/auth.service";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  otp: string;
};

export default function ForgotPasswordOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const phoneNumber = location.state?.phone_number as string | undefined;

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [resendTimer]);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch("otp", "");

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    if (!canResend || !phoneNumber) return;

    try {
      await authService.requestOtp(phoneNumber, "password_reset");
      toast.success("OTP resent successfully!");
      setResendTimer(300);
      setCanResend(false);
      setValue("otp", "");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      const ephemeralToken = await authService.verifyOtp(phoneNumber, data.otp, "password_reset");
      toast.success("OTP verified successfully!");
      navigate("/auth/forgot-password/reset", { state: { ephemeral_token: ephemeralToken } });
    } catch (error: any) {
      const fieldErrors = error.response?.data?.data;
      const otpError = fieldErrors?.otp?.[0];
      toast.error(otpError || error.response?.data?.message || "OTP verification failed");
      setValue("otp", "");
    } finally {
      setIsLoading(false);
    }
  };

  if (!phoneNumber) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h1>
              <p className="text-gray-600">Enter the 6-digit code sent to {phoneNumber}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <OtpInput value={otpValue} onChange={(value) => setValue("otp", value)} />
                {errors.otp && (
                  <p className="mt-2 text-xs text-red-500 text-center">{errors.otp.message}</p>
                )}
              </div>

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
                  <p className="text-gray-500 text-sm">Resend OTP in {formatTime(resendTimer)}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpValue.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/auth/forgot-password"
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

