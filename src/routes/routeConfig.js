import Dashboard from "../components/Dashboard";
import UserList from "../components/UserList";
import Settings from "../components/Settings";
import Login from "../components/Login";
import AccessError from "../errors/AccessError";

export const publicRoutes = [
  { path: "/", element: <Login /> },
  { path: "/unauthorized", element: <AccessError /> },
  { path: "*", element: <AccessError type={404} /> },
];

export const protectedRoutes = [
  { path: "/admin/dashboard", element: <Dashboard /> },
  {
    path: "/admin/users",
    element: <UserList />,
    permissions: ["user:read"],
  },
  { path: "/admin/settings", element: <Settings /> },
];
