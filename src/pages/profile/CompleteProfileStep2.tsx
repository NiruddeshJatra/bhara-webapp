import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { IdCard, Upload, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";

import { profileStep2Schema } from "@/utils/validators";
import authService from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  nid_number: string;
  nid_image: File | null;
  institutional_id_image?: File | null;
};

export default function CompleteProfileStep2() {
  const [isLoading, setIsLoading] = useState(false);
  const [nidPreviewName, setNidPreviewName] = useState<string | null>(null);
  const [instPreviewName, setInstPreviewName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.is_approved === true) {
      navigate("/profile", { replace: true });
      return;
    }
    if (!user.profile_completed) {
      navigate("/profile/complete/step1", { replace: true });
    }
  }, [navigate, user]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(profileStep2Schema),
    defaultValues: {
      nid_image: null,
      institutional_id_image: null,
    },
  });

  const nidFile = watch("nid_image");
  const instFile = watch("institutional_id_image");

  useEffect(() => {
    setNidPreviewName(nidFile?.name ?? null);
  }, [nidFile]);

  useEffect(() => {
    setInstPreviewName(instFile?.name ?? null);
  }, [instFile]);

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return false;
    }
    return true;
  };

  const onDropNid = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!validateImage(file)) return;
      setValue("nid_image", file, { shouldValidate: true });
    },
    [setValue],
  );

  const onDropInst = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!validateImage(file)) return;
      setValue("institutional_id_image", file, { shouldValidate: true });
    },
    [setValue],
  );

  const nidDropzone = useDropzone({
    onDrop: onDropNid,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxFiles: 1,
    multiple: false,
  });

  const instDropzone = useDropzone({
    onDrop: onDropInst,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxFiles: 1,
    multiple: false,
  });

  const onSubmit = async (data: FormData) => {
    if (!data.nid_image) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('nid_number', data.nid_number);
      formData.append("nid_image", data.nid_image);
      if (data.institutional_id_image) {
        formData.append("institutional_id_image", data.institutional_id_image);
      }

      await authService.submitIdentity(formData);
      toast.success("Documents submitted! We'll notify you once reviewed.");
      navigate("/advertisements", { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit documents";
      const fieldErrors = error.response?.data?.data;

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) toast.error(`${field}: ${messages[0]}`);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="w-16 h-1 bg-green-600" />
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
              </div>
              <span className="ml-4 text-sm text-gray-600">Step 2 of 2</span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification</h1>
              <p className="text-gray-600">Submit your documents to get verified</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="nid_number"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  NID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    {...register("nid_number")}
                    id="nid_number"
                    type="text"
                    placeholder="Your NID/Passport/License number"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.nid_number ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.nid_number && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    {errors.nid_number.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Govt. ID Image
                </label>
                <div
                  {...nidDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                    nidDropzone.isDragActive
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...nidDropzone.getInputProps()} />
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Upload your Govt. ID (NID front, Passport, or Driving License)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {nidPreviewName ? `Selected: ${nidPreviewName}` : "PNG/JPG/WebP up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>
                {errors.nid_image && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    {errors.nid_image.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Institutional ID (Optional)
                </label>
                <div
                  {...instDropzone.getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                    instDropzone.isDragActive
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input {...instDropzone.getInputProps()} />
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        Upload University or Office ID (optional)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {instPreviewName ? `Selected: ${instPreviewName}` : "PNG/JPG/WebP up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-700 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Your documents are reviewed by Bhara within 24–48 hours.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Submitting..." : "Submit for Verification"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/advertisements")}
                className="w-full text-sm font-medium text-green-700 hover:text-green-800"
                disabled={isLoading}
              >
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

