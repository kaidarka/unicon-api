import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import {checkAuth} from "../middlewares/user.mw";

const router = Router();

router.post("/auth/login", UserController.login);
router.post("/auth/registration", UserController.register);
router.get("/auth/me", checkAuth, UserController.getMe);
router.get("/auth/logout", UserController.logout);
router.get("/auth/refresh", UserController.refresh);

export default router;
