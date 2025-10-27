import jwt, { Secret } from "jsonwebtoken";
import { env } from "../env.config.js";
import { JWTPayload } from "../types/common";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  // @ts-expect-error typings strictness
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN || "1h",
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  // @ts-expect-error typings strictness
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};

export const generateTokenPair = (payload: JWTPayload): TokenPair => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as JWTPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN || "7d";
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error("Invalid JWT_REFRESH_EXPIRES_IN format");
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const now = new Date();
  switch (unit) {
    case "d":
      now.setDate(now.getDate() + value);
      break;
    case "h":
      now.setHours(now.getHours() + value);
      break;
    case "m":
      now.setMinutes(now.getMinutes() + value);
      break;
    case "s":
      now.setSeconds(now.getSeconds() + value);
      break;
  }
  return now;
};
