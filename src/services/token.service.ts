import jwt, {JwtPayload} from "jsonwebtoken";
import TokenSchema from "../models/token.model";

export interface TokenPayload {
    email: string;
    _id: string;
}

const generateTokens = (payload: { email: string, _id: string }) => {
    const accessToken = jwt.sign(payload,
        // TODO rewrite secret
        "secret",
        {
            expiresIn: "30m",
        }
    );
    const refreshToken = jwt.sign(payload,
        // TODO rewrite secret
        "secret",
        {
            expiresIn: "30d",
        }
    );
    return {
        refreshToken,
        accessToken
    };
};

const saveToken = async (userId: string, refreshToken: string) => {
    const tokenData = await TokenSchema.findOne({user: userId});
    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    }
    return await TokenSchema.create({user: userId, refreshToken});
};

const removeToken = async (refreshToken: string) => {
    return TokenSchema.deleteOne({refreshToken});
};

const validateAccessToken = (token: string) => {
    try {
        // TODO rewrite secret
        return jwt.verify(token, "secret");
    } catch (err) {
        return null;
    }
};

const validateRefreshToken = (token: string) => {
    try {
        // TODO rewrite secret
        const payload: JwtPayload | string = jwt.verify(token, "secret");
        if (typeof payload !== "object" || !payload.email || !payload._id) {
            throw new Error("Invalid token payload");
        }
        return {
            email: payload.email,
            _id: payload._id
        }
    } catch (err) {
        return null;
    }
};

const findToken = async (refreshToken: string) => {
    return TokenSchema.findOne({refreshToken});
};

export default {
    saveToken,
    generateTokens,
    removeToken,
    validateAccessToken,
    validateRefreshToken,
    findToken,
};
