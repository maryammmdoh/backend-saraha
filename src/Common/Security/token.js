import { SIGNATURE_KEY_ADMIN, SIGNATURE_KEY_ADMIN_REFRESH, SIGNATURE_KEY_USER, SIGNATURE_KEY_USER_REFRESH } from "../../../Config/config.service.js";
import  jwt  from 'jsonwebtoken';
import { RoleEnum } from "../Enums/user.enums.js";
import { TokenType } from "../Enums/token.enums.js";
import crypto from "crypto";

export function getSignatureKeyByRole(role) {
    let refreshSignatureKey;
    let accessSignatureKey;
        switch (role) {
            case RoleEnum.User:
                refreshSignatureKey = SIGNATURE_KEY_USER_REFRESH;
                accessSignatureKey = SIGNATURE_KEY_USER;
                break;
            case RoleEnum.Admin:
                refreshSignatureKey = SIGNATURE_KEY_ADMIN_REFRESH;
                accessSignatureKey = SIGNATURE_KEY_ADMIN;
                break;
        }
        return { refreshSignatureKey, accessSignatureKey };
}

export function generateToken({payload = {}, signatureKey, options = {}}) {
    return jwt.sign(payload, signatureKey, options);
}

export function verifyToken({token, signatureKey}) {
    try {
        return jwt.verify(token, signatureKey);
    } catch (error) {
        throw error;
    }
}

export function decodeToken(token) {
    return jwt.decode(token);
}

export function generateAccessAndRefreshToken( user) {
    const { accessSignatureKey, refreshSignatureKey } = getSignatureKeyByRole(
    user.role,
  );
  
  const tokenID = crypto.randomUUID(); // Generate a unique identifier for the token (jti)

  const access_token = generateToken({
    signatureKey: accessSignatureKey,
    options: {
      audience: [user.role, TokenType.ACCESS],
      expiresIn: 60 * 15,
      subject: user._id.toString(),
      jwtid: tokenID,
    },
  });

  const refresh_token = generateToken({
    signatureKey: refreshSignatureKey,
    options: {
      audience: [user.role, TokenType.REFRESH],
      expiresIn: "1y",
      subject: user._id.toString(),
      jwtid: tokenID,
    },
  });

  return { access_token, refresh_token };
}