import axios from "axios";
import SummaryAPi, { baseURL } from "../Common/SummaryApi";

const Axios = axios.create({
  baseURL: baseURL,
});

// Attach access token to every request
Axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accesstoken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access token
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshtoken");
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios({
      ...SummaryAPi.refreshToken,
      baseURL,
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    const accessToken = response.data.data.accessToken;
    localStorage.setItem("accesstoken", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Failed to refresh token", error);
    return null;
  }
};

export default Axios;
