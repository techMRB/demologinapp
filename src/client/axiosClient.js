import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

let currentAccessToken = null;

export const setAccessToken = (token) => {
    currentAccessToken = token 
}

export const getAccessToken = () => currentAccessToken

const api = axios.create({
    baseURL : BASE_URL,
    withCredentials: true
})

api.interceptors.request.use((config) => {
    if(currentAccessToken) {
        config.headers.Authorization = `Bearer ${currentAccessToken}`
    }
    return config
})
