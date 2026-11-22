import axios from "axios";
import { API_URL } from "../config.js";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Small helper: readable error message from any API error
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.message || (error?.code === "ERR_NETWORK" ? "Cannot reach the server. Check your connection." : fallback);

export const getErrorCode = (error) => error?.response?.data?.code || null;

export default api;
