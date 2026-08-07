import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

let currentAccessToken = null;
export const setAccessToken = (token) => {
    currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;
let forceLogoutCallback = () => { };
export const registerForceLogout = (callback) => {
    forceLogoutCallback = callback;
};

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (currentAccessToken) {
        config.headers.Authorization = "Bearer " + currentAccessToken;
    }
    return config;
});

let isCurrentlyRefreshing = false;
let requestsWaitingForRefresh = [];
const resolveWaitingRequests = (error, newAccessToken) => {
    requestsWaitingForRefresh.forEach((waitingRequest) => {
        if (error) {
            waitingRequest.reject(error);
        } else {
            waitingRequest.resolve(newAccessToken);
        }
    });
    requestsWaitingForRefresh = [];
};

const urlIncludes = (config, path) => Boolean(config?.url && config.url.includes(path));
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(
            "[axiosClient] error caught:",
            error.response?.status,
            error.config?.url
        );
        const failedRequest = error.config;
        if (!failedRequest || !error.response) {
            console.log("[axiosClient] no response object — likely CORS or network failure");
            return Promise.reject(error);
        }
        const statusCode = error.response.status;
        const alreadyRetried = failedRequest._alreadyRetried === true;
        const isExemptFromRefresh =
            urlIncludes(failedRequest, "/auth/login") ||
            urlIncludes(failedRequest, "/auth/refresh") ||
            urlIncludes(failedRequest, "/auth/logout");
        if (statusCode !== 401 || alreadyRetried || isExemptFromRefresh) {
            return Promise.reject(error);
        }
        const errorCode = error.response.data?.code;
        const isReuseDetected = errorCode === "REFRESH_TOKEN_REUSE_DETECTED" || statusCode === 403;
        if (isReuseDetected) {
            forceLogoutCallback("Suspicious activity detected. Please log in again.");
            return Promise.reject(error);
        }
        if (isCurrentlyRefreshing) {
            return new Promise((resolve, reject) => {
                requestsWaitingForRefresh.push({ resolve, reject });
            }).then((newAccessToken) => {
                failedRequest.headers.Authorization = "Bearer " + newAccessToken;
                failedRequest._alreadyRetried = true;
                return api(failedRequest);
            });
        }
        isCurrentlyRefreshing = true;
        failedRequest._alreadyRetried = true;
        try {
            const refreshResponse = await api.post("/auth/refresh");
            console.log("[axiosClient] refresh response:", refreshResponse.data);
            const newAccessToken = refreshResponse.data.accessToken;
            setAccessToken(newAccessToken);
            resolveWaitingRequests(null, newAccessToken);
            failedRequest.headers.Authorization = "Bearer " + newAccessToken;
            return api(failedRequest);
        } catch (refreshError) {
            resolveWaitingRequests(refreshError, null);
            forceLogoutCallback("Your session has expired. Please log in again.");
            return Promise.reject(refreshError);
        } finally {
            isCurrentlyRefreshing = false;
        }
    }
);

export default api;
