import {User as UserModel} from "../models/user.model";
import { Request } from 'express';
import bcrypt from "bcrypt";
import TokenService from "./token.service";

const registration = async (req: Request) => {
    const candidate = await UserModel.findOne({ email: req.body?.email });
    if (candidate) {
        throw new Error("Пользователь с таким Email уже существует");
    }
    const password = req.body?.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
        email: req.body?.email,
        fullName: req.body?.fullName,
        avatarUrl: req.body?.avatarUrl,
        password: hash
    });


    const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
    await TokenService.saveToken(user._id, tokens.refreshToken);

    return { ...tokens, user };
};

const login = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error("Пользователь не найден");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Неверный пароль");
    }

    const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
    await TokenService.saveToken(user._id, tokens.refreshToken);

    return { ...tokens, user };
};

const logout = async (refreshToken: string) => {
    return TokenService.removeToken(refreshToken);
};

const refresh = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new Error("Ошибка сервера");
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await TokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
        return (new Error("Неавторизованный пользователь"));
    }
    if (userData) {
        const user = await UserModel.findById(userData._id);
        if (user) {
            const tokens = TokenService.generateTokens({ email: user.email, _id: user._id });
            await TokenService.saveToken(user._id, tokens.refreshToken);
            return { ...tokens, user };
        }
    }
    return (new Error("Ошибка авторизации"));
};

export default {
    registration,
    login,
    logout,
    refresh,
};
