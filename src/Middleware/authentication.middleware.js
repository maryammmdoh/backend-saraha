import { TokenType } from "../Common/Enums/token.enums.js";
import {
  decodeToken,
  getSignatureKeyByRole,
  verifyToken,
} from "../Common/Security/token.js";
import { unauthorizedException } from "../Common/Response/response.js";
import * as DBRepo from "../DB/db.repository.js";
import UserModel from "../DB/Models/User.model.js";
import * as redisServices from "../DB/redis.service.js";

export function authentication(tokenTypeParam = TokenType.ACCESS) {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      return unauthorizedException(
        "Invalid token format, Bearer token required",
      );
    }

    const decodedToken = decodeToken(token);
    const [userRole, tokenType] = decodedToken.aud; // Assuming the audience claim is an array with [userRole, tokenType]

    if (tokenType !== tokenTypeParam) {
      return unauthorizedException(
        `Invalid token type, ${tokenTypeParam.toLowerCase()} token required`,
      );
    }

    const { accessSignatureKey, refreshSignatureKey } =
      getSignatureKeyByRole(userRole);
    const signatureKey =
      tokenTypeParam === TokenType.ACCESS
        ? accessSignatureKey
        : refreshSignatureKey;
    const verified = verifyToken({ token, signatureKey });
    // Check if the token has been revoked by looking it up in Redis using the token's unique identifier (jti) and the user's ID (sub) from the token payload, if the token is found in the blacklist, it means it has been revoked and we should reject the request with an unauthorized error.
    if (verified.jti &&
      (await redisServices.exists({
        key: redisServices.getBlacklistTokenKey({ userId: verified.sub, tokenId: verified.jti }),
      }))
    ) {
      return unauthorizedException(
        "you have been logged out, please log in again",
      );
    }

    const user = await DBRepo.findByid({ model: UserModel, id: verified.sub });
    if (!user) {
      return unauthorizedException("Account not found , create an account");
    }

    if (verified.iat * 1000 < user.changeCreditTime) {
      // Convert changeCreditTime to milliseconds
      return unauthorizedException(
        "Token is no longer valid, please log in again",
      );
    }

    req.user = user;
    req.tokenPayload = verified; // Store the decoded token payload in the request object for later use in the controller or other middleware
    next();
  };
}
