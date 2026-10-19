export const APIEndpoint = {
    REGISTER: "http://localhost:5000/api/users/register",
    VERIFY_EMAIL: "http://localhost:5000/api/users/verify-email",
    LOGIN_URL: "http://localhost:5000/api/auth/login",
    GET_ALL_USERS: "/users/get-all-users",
    CREATE_USER: "/users",
    UPDATE_USER: (id) => `/users/${id}`,
    DELETE_USER: (id) => `/users/${id}`,
    // Permissions
    GET_ALL_PERMISSIONS: "/permissions",
    CREATE_PERMISSION: "/permissions",
    UPDATE_PERMISSION: (id) => `/permissions/${id}`,
    DELETE_PERMISSION: (id) => `/permissions/${id}`,
    // Roles
    GET_ALL_ROLES: "/roles",
    CREATE_ROLE: "/roles",
    UPDATE_ROLE: (id) => `/roles/${id}`,
    DELETE_ROLE: (id) => `/roles/${id}`,
}