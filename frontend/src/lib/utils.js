import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const DEV_MODE = true
export const BACKEND_API_URL = 'http://127.0.0.1:8000';
export const API_VERIFY_URL = DEV_MODE ? `${BACKEND_API_URL}/api/accounts/token/verify/` : `/api/accounts/token/verify/`;
export const API_REFRESH_URL = DEV_MODE ? `${BACKEND_API_URL}/api/accounts/token/refresh/` : `/api/accounts/token/refresh/`;

export const verifyToken = async (token) => {
  try {
  await axios.post(API_VERIFY_URL, {'token': token});
  return true;
  } catch (err) {
    return false
  }
};

export async function refreshToken() {
  try {
    const refresh = localStorage.getItem("refresh")
    const response = await axios.post(API_REFRESH_URL, { refresh });
    const { access } = response.data;
    if (access) {
      localStorage.setItem("access", access);
      return access;
    }
  } catch (err) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // window.location.href = "/";
  }
}