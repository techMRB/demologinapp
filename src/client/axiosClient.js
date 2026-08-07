// One axios instance the whole app uses to talk to the backend. It adds
// two behaviour on top of plain axios:
// 1. It automatically adds the access token to the Authorization header of every request.
// 2. It automatically refreshes the access token when it expires, and retries the failed request.

import axios from "axios";

// change this to match your backend URL
const BASE_URL = "http://localhost:5000/api";

let currentAccessToken = null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

// AuthContext.js registers this so axiosClient can trigger a full logout
//  when it detects a refresh token reuse attack.
let forceLogoutCallback = null;
export const registerForceLogout = (callback) => {
  forceLogoutCallback = callback;
};

//
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

//Before every request, add the access token to the Authorization header
api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// if several requests fail with 401 at the same time, we only want to
// refresh the token once, and then retry all the failed requests with the new token.
// This is what these variables are for.
let isCurrentlyRefreshing = false;
let requestWaitingForRefresh = [];

const resolveWaitingRequests = (error, newAccessToken) => {
  requestWaitingForRefresh.forEach((waitingRequest) => {
    if (error) {
      waitingRequest.reject(error);
    } else {
      waitingRequest.resolve(newAccessToken);
    }
  });
  requestWaitingForRefresh = [];
};

const urlIncludes = (config, path) => Boolean(config?.url && config.url.includes(path))

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // const failedRequest = error.config;
    // const statusCode = error.response ? error.response.status : null;

    // // Not a 401 error, or the request has already been retried,
    // // or the failed request is the refresh call itself - nothing to do here, just reject the error.
    // const alreadyRetried = failedRequest._alreadyRetried === true;
    // const isRefreshCallItself =
    //   failedRequest.url && failedRequest.url.includes("/auth/refresh");

    // if (statusCode === 401 && alreadyRetried && isRefreshCallItself) {
    //   return Promise.reject(error);
    // }
    // console.log(
    //   "[axiosClient] error caught: ",
    //   error.response?.status,
    //   error.config?.url
    // )

    const failedRequest = error.config
    if(!failedRequest || !error.response){
      console.log("Axios Client Error")
      return Promise.reject(error)
    }

    const statusCode = error.response.status
    const alreadyRetried = failedRequest._alreadyRetried === true;

    const isExemptFromRefresh = 
    urlIncludes(failedRequest, "/auth/login") ||
    urlIncludes(failedRequest, "/auth/refresh") ||
    urlIncludes(failedRequest, "/auth/logout")

    if(statusCode !== 401 || alreadyRetried || isExemptFromRefresh){
      return Promise.reject(error)
    }

    // Reuse detection: If the refresh token has been used in another session,
    // the backend will return a specific error code. In that case,
    // we want to log the user out immediately.
    const errorCode = error.response?.data?.code;
    const isReuseDetected =
      errorCode === "REFRESH_TOKEN_REUSE_DETECTED" || statusCode === 403;

    if (isReuseDetected) {
      forceLogoutCallback(
        "Suspicious activity detected. You have been logged out for security reasons.",
      );
      return Promise.reject(error);
    }
    // Normal expired access token - refresh it.
    if (isCurrentlyRefreshing) {
      // Someone else is already refreshing the token,
      // we just wait for them to finish and then retry the request.
      return new Promise((resolve, reject) => {
        requestWaitingForRefresh.push({ resolve, reject });
      }).then((newAccessToken) => {
        failedRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        failedRequest._alreadyRetried = true;
        return api(failedRequest);
      });
    }

    isCurrentlyRefreshing = true;
    failedRequest._alreadyRetried = true;

    try {
      // No need to send the refresh token in the body, it's already in the cookie.
      const refreshResponse = await api.post("/auth/refresh");
      const newAccessToken = refreshResponse.data.accessToken;
      setAccessToken(newAccessToken);
      resolveWaitingRequests(null, newAccessToken);
      failedRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(failedRequest);
    } catch (refreshError) {
      resolveWaitingRequests(refreshError, null);
      forceLogoutCallback("Session expired. Please log in again.");
      return Promise.reject(refreshError);
    } finally {
      isCurrentlyRefreshing = false;
    }
  }
);

export default api;
