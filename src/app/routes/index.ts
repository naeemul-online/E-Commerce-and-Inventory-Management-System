import express from "express";
import { adminRoutes } from "../modules/admin/admin.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.route";

const router = express.Router();

// TODO:
/* 
1. register user
2. login user
3. logout user
4. refresh token
5. forgot password
6. reset password
7. get user profile
8. update user profile
9. delete user profile
*/

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/admin", route: adminRoutes },
  { path: "/user", route: userRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
