import { User as UserModel } from '../models/user.model';
import { type Request } from 'express';
import bcrypt from 'bcrypt';
import TokenService from './token.service';

const registration = async (req: Request): Promise<{ refreshToken: string
  accessToken: string
  user: object
}> => {
  const candidate = await UserModel.findOne({ email: req.body?.email });
  if (candidate != null) {
    throw new Error('Пользователь с таким Email уже существует');
  }
  const user = await UserModel.create({
    email: req.body?.email,
    fullName: req.body?.fullName,
    avatarUrl: req.body?.avatarUrl,
    password: req.body?.password
  });

  const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
  await TokenService.saveToken(user._id, tokens.refreshToken);

  return { ...tokens, user };
};

const login = async (email: string, password: string): Promise<{ refreshToken: string
  accessToken: string
  user: object
}> => {
  const user = await UserModel.findOne({ email });
  if (user == null) {
    throw new Error('Пользователь не найден');
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Неверный пароль');
  }
  const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
  await TokenService.saveToken(user._id, tokens.refreshToken);

  return { ...tokens, user };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const logout = async (refreshToken: string) => {
  return await TokenService.removeToken(refreshToken);
};

const refresh = async (refreshToken: string): Promise<{ refreshToken: string
  accessToken: string
  user: object
} | Error> => {
  try {
    if (refreshToken !== '') {
      const userData: Error | { _id: string, email: string } | null = TokenService.validateRefreshToken(refreshToken);
      const tokenFromDB = await TokenService.findToken(refreshToken);
      if ((userData === null) || (tokenFromDB === null) || userData instanceof Error) {
        return (new Error('Неавторизованный пользователь'));
      } else {
        const user = await UserModel.findById(userData._id);
        if (user != null) {
          const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
          await TokenService.saveToken(user._id, tokens.refreshToken);
          return { ...tokens, user };
        }
      }
    }
    return (new Error('Ошибка авторизации'));
  } catch (err) {
    return (new Error('Ошибка авторизации'));
  }
};

export default {
  registration,
  login,
  logout,
  refresh
};
