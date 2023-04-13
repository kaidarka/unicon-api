import jwt, { type JwtPayload } from 'jsonwebtoken';
import TokenSchema from '../models/token.model';

export interface TokenPayload {
  email: string
  _id: string
}

const generateTokens = (payload: { email: string, _id: string }): { refreshToken: string
  accessToken: string } => {
  const accessToken = jwt.sign(payload,
    process.env.JWT_SECRET ?? 'mysecret',
    {
      expiresIn: '30m'
    }
  );
  const refreshToken = jwt.sign(payload,
    process.env.JWT_SECRET ?? 'mysecret',
    {
      expiresIn: '30d'
    }
  );
  return {
    refreshToken,
    accessToken
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const saveToken = async (userId: string, refreshToken: string) => {
  const tokenData = await TokenSchema.findOne({ user: userId });
  if (tokenData != null) {
    tokenData.refreshToken = refreshToken;
    return await tokenData.save();
  }
  return await TokenSchema.create({ user: userId, refreshToken });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const removeToken = async (refreshToken: string) => {
  return await TokenSchema.deleteOne({ refreshToken });
};

const validateAccessToken = (token: string): JwtPayload | null | string => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET ?? 'mysecret');
  } catch (err) {
    return null;
  }
};

const validateRefreshToken = (token: string): { _id: string, email: string } | null | Error => {
  try {
    const payload: JwtPayload | string = jwt.verify(token, process.env.JWT_SECRET ?? 'mysecret');
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (typeof payload !== 'object' || !payload.email || !payload._id) {
      return new Error('Invalid token payload');
    }
    return {
      email: payload.email,
      _id: payload._id
    };
  } catch (err) {
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const findToken = async (refreshToken: string) => {
  return await TokenSchema.findOne({ refreshToken });
};

export default {
  saveToken,
  generateTokens,
  removeToken,
  validateAccessToken,
  validateRefreshToken,
  findToken
};
