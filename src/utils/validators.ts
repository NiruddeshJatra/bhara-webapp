import { z } from 'zod';

const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const phoneSchema = z.object({
  phone_number: z
    .string()
    .regex(bdPhoneRegex, 'Enter a valid Bangladeshi phone number (e.g. 01712345678)')
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric')
});

export const signupDetailsSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirm_password: z.string(),
  marketing_consent: z.boolean().default(false),
}).refine(
  (data) => data.password === data.confirm_password,
  { message: 'Passwords do not match', path: ['confirm_password'] }
);

export const loginSchema = z.object({
  phone_number: z.string().regex(bdPhoneRegex, 'Enter a valid Bangladeshi phone number'),
  password: z.string().min(1, 'Password is required'),
});

const eighteenYearsAgo = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
};

export const profileStep1Schema = z.object({
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const dob = new Date(val);
      return dob <= eighteenYearsAgo();
    }, 'You must be at least 18 years old'),
  district: z.string().min(1, 'District is required'),
  thana: z.string().min(1, 'Thana is required'),
  full_address: z.string().min(5, 'Please enter a valid address'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  profile_picture: z.instanceof(File).optional().nullable(),
});

export const profileStep2Schema = z.object({
  nid_number: z.string().min(1, 'NID number is required'),
  nid_image: z.instanceof(File, { message: 'NID image is required' }),
  institutional_id_image: z.instanceof(File).optional().nullable(),
});
