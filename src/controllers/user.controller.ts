import { type Request, type Response } from 'express';
import { User as UserModel } from '../models/user.model';
import UserService from '../services/user.service';
interface RequestWithUser extends Request {
  user: {
    id: string
  }
}

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userData = await UserService.registration(req);
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    return res.json(userData);
  } catch (err) {
    return res.status(500).json({
      message: 'Не удалось зарегистрироваться'
    });
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await
    UserModel.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
      useFindAndModify: false
    });
    if (user == null) {
      return res.status(404).send('User not found.');
    } else {
      return res.json(user);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await UserModel.findByIdAndRemove(req.params.userId, {
      useFindAndModify: false
    });
    if (user == null) {
      return res.status(404).send('User not found.');
    } else {
      return res.json(user);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const userData = await UserService.login(email, password);
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    return res.json(userData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Не удалось авторизоваться'
    });
  }
};

export const getMe = async (req: RequestWithUser, res: Response): Promise<Response> => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (user == null) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    const userData = (user as any)._doc;

    return res.json(userData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Нет доступа'
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.cookies;
    const userData = await UserService.refresh(refreshToken);

    if (userData instanceof Error) {
      return res.status(401).json({
        message: 'Ошибка авторизации'
      });
    }

    res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

    return res.json(userData);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { refreshToken } = req.cookies;
    const token = UserService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return res.json(token);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
