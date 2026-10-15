import Dashboard from "../components/dashboard/Dashboard";
import UserList from "../components/users/UserList";
import Settings from "../components/settings/Settings";
import Login from "../components/loginForm/login";
import AccessError from "../errors/AccessError";

export const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/unauthorized", element: <AccessError /> },
  { path: "*", element: <AccessError type={404} /> },
];

export const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  {
    path: "/users",
    element: <UserList />,
    permissions: ["user:read"],
  },
  { path: "/settings", element: <Settings /> },
];
