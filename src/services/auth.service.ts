import api from "@/lib/axios";
import type { User } from "@/types/auth";

const authService = {
  async requestOtp(phone_number: string, purpose: "signup" | "password_reset") {
    const res = await api.post("/auth/otp/request/", { phone_number, purpose });
    return res.data;
  },

  async verifyOtp(phone_number: string, otp: string, purpose: "signup" | "password_reset") {
    const res = await api.post("/auth/otp/verify/", { phone_number, otp, purpose });
    return res.data.data.ephemeral_token as string;
  },

  async signupComplete(ephemeralToken: string, payload: {
    full_name: string;
    password: string;
    marketing_consent: boolean;
  }) {
    const res = await api.post("/auth/signup/complete/", payload, {
      headers: { Authorization: `Bearer ${ephemeralToken}` },
    });
    return res.data.data as { access_token: string; user: User };
  },

  async login(phone_number: string, password: string) {
    const res = await api.post("/auth/login/", { phone_number, password });
    return res.data.data as { access_token: string; user: User };
  },

  async logout() {
    await api.post("/auth/logout/");
  },

  async getProfile() {
    const res = await api.get("/users/profile/");
    return res.data.data as User;
  },

  async updateProfile(data: FormData) {
    const res = await api.patch("/users/profile/step1/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data as User;
  },

  async submitIdentity(data: FormData) {
    const res = await api.post("/users/profile/step2/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async updateFullName(full_name: string) {
    const res = await api.patch("/users/profile/", { full_name });
    return res.data.data as User;
  },

  async passwordResetComplete(ephemeralToken: string, password: string) {
    const res = await api.post("/auth/password-reset/complete/", { password }, {
      headers: { Authorization: `Bearer ${ephemeralToken}` },
    });
    return res.data;
  },
};

export default authService;
