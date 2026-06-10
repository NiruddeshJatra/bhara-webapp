import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Mail, Camera } from "lucide-react";
import { profileStep1Schema } from "@/utils/validators";
import { BD_DISTRICTS, getThanas } from "@/utils/bd-districts";
import authService from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { Footer } from "@/components/common/Footer";
import { NavBar } from "@/components/common/NavBar";

type FormData = {
  date_of_birth: string;
  district: string;
  thana: string;
  full_address: string;
  email?: string;
  profile_picture?: File | null;
};

export default function CompleteProfileStep1() {
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Redirect if profile already completed
  useEffect(() => {
    if (user?.profile_completed) {
      navigate('/profile/complete/step2');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(profileStep1Schema),
  });

  const selectedDistrict = watch('district', '');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be under 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setValue('profile_picture', file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'profile_picture' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      navigate('/profile/complete/step2');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      const fieldErrors = error.response?.data?.data;
      
      if (fieldErrors) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-lime-100/20">
      <NavBar />
      <main className="flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <div className="bg-gradient-to-b from-white to-lime-50 rounded-xl shadow-lg p-8 animate-fade-up">
          {/* Step Progress */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div className="w-16 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
            </div>
            <span className="ml-4 text-sm text-gray-600">Step 1 of 2</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Add your personal information to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                {profilePreview ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={profilePreview} 
                      alt="Profile preview" 
                      className="w-24 h-24 rounded-full object-cover mb-2"
                    />
                    <p className="text-sm text-gray-600">Click to change photo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Camera className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? 'Drop photo here' : 'Click to upload photo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
                  </div>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  id="date_of_birth"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.date_of_birth.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Must be 18 or older</p>
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  {...register('district')}
                  id="district"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none ${
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Select district</option>
                  {BD_DISTRICTS.map((district) => (
                    <option key={district.name} value={district.name}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.district && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Thana */}
            <div>
              <label htmlFor="thana" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Thana
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  {...register('thana')}
                  id="thana"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none ${
                    errors.thana ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading || !selectedDistrict}
                >
                  <option value="">Select thana</option>
                  {getThanas(selectedDistrict).map((thana) => (
                    <option key={thana} value={thana}>
                      {thana}
                    </option>
                  ))}
                </select>
              </div>
              {errors.thana && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.thana.message}
                </p>
              )}
            </div>

            {/* Full Address */}
            <div>
              <label htmlFor="full_address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Full Address
              </label>
              <textarea
                {...register('full_address')}
                id="full_address"
                rows={3}
                placeholder="House/Road/Area details"
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  errors.full_address ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.full_address && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.full_address.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="For receipts and notifications"
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
