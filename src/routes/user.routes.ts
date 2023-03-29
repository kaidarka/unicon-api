import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import {authenticate} from "../middlewares/user.mw";

const router = Router();

router.post('/registration', UserController.registration);
router.get('/', authenticate, UserController.findAll);
router.get('/:userId', UserController.findOne);
router.put('/:userId', UserController.update);
router.delete('/:userId', UserController.remove);
router.post('/login', UserController.login);

export default router;
