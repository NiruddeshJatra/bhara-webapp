import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";

import authService from "@/services/auth.service";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

const passwordResetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
});

type FormData = z.infer<typeof passwordResetSchema>;

export default function ForgotPasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const ephemeralToken = location.state?.ephemeral_token as string | undefined;

  useEffect(() => {
    if (!ephemeralToken) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [ephemeralToken, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!ephemeralToken) return;

    setIsLoading(true);
    try {
      await authService.passwordResetComplete(ephemeralToken, data.password);
      toast.success("Password reset successfully. Please sign in.");
      navigate("/auth/login", { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Password reset failed";
      const fieldErrors = error.response?.data?.data;
      const passwordError = fieldErrors?.password?.[0];
      toast.error(passwordError || errorMessage);
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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Set a new password for your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter a new password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Back to{" "}
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

