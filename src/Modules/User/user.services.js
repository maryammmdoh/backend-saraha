import { TokenType } from "../../Common/Enums/token.enums.js";
import {
  generateToken,
  getSignatureKeyByRole,
} from "../../Common/Security/token.js";
import * as DBRepo from "../../DB/db.repository.js";
import { decryptValue } from "../../Common/Security/encrpt.js";
import * as redisServices from "../../DB/redis.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";

export async function renewToken(UserData) {
  const { accessSignatureKey } = getSignatureKeyByRole(UserData.user.role);
  // Generate new access token
  const newAccessToken = generateToken({
    signatureKey: accessSignatureKey,
    options: {
      audience: [UserData.user.role, TokenType.ACCESS],
      expiresIn: 60 * 15,
      subject: UserData.user.id.toString(),
    },
  });
  return { accessToken: newAccessToken };
}

export async function uploadProfilePicture(userId, file) {
  // Here you would typically save the file information to the user's profile in the database
  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: userId },
    updateData: { profileImage: file.finalPath },
  });
  return {
    message: "Profile picture uploaded successfully",
    filePath: file.finalPath,
  };
}

export async function uploadCoverPicture(userId, files) {
  // Here you would typically save the file information to the user's profile in the database
  //   const filePaths = [];
  // for (const file of files) {
  //     filePaths.push(file.finalPath);
  // }
  const filePaths = files.map((file) => {
    return file.finalPath;
  });

  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: userId },
    updateData: { coverImage: filePaths },
  });
  return {
    message: "Cover picture uploaded successfully",
    filePaths: filePaths,
  };
}

export async function getAnotherUserProfile(profileId) {
  const user = await DBRepo.findByid({
    model: UserModel,
    id: profileId,
    select:
      "-password -role -provider -confirmEmail -createdAt -updatedAt -__v",
  });
  if (user.phone) {
    const decryptedPhone = decryptValue({ encryptedValue: user.phone });
    user.phone = decryptedPhone;
  }
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function logout(userId, tokenData, logoutOptions) {
  if (logoutOptions == "all") {
    await DBRepo.updateOne({
      model: UserModel,
      filters: { _id: userId },
      updateData: { changeCreditTime: new Date() },
    });
  } else if (logoutOptions == "current") {
    // In this case we will not store the revoked token in the database, instead we will store it in Redis with an expiration time equal to the remaining time until the token would naturally expire, this will allow for efficient token revocation checks without the need to query the database for revoked tokens on every request, and it will also automatically clean up expired revoked tokens from Redis after their expiration time has passed.
    //  await DBRepo.create({
    // model: TokenModel,
    // data: {
    //   jti: tokenData.jti,
    //   userId,
    //   // Set the expiration time for the revoked token (e.g., 1 year from now) , this will help in automatically cleaning up old revoked tokens from the database after they expire and it will also prevent the database from growing indefinitely with revoked tokens that are no longer valid after their expiration time has passed.
    //   expiresAt: new Date((tokenData.iat + 60 * 60 * 24 * 365) * 1000), // Set the expiration time for the revoked token (e.g., 1 year from now)
    // },
    //  });

    // Store the revoked token in Redis with an expiration time equal to the remaining time until the token would naturally expire, this will allow for efficient token revocation checks without the need to query the database for revoked tokens on every request, and it will also automatically clean up expired revoked tokens from Redis after their expiration time has passed.
    await redisServices.set({
      key: redisServices.getBlacklistTokenKey({
        userId,
        tokenId: tokenData.jti,
      }),
      value: tokenData.jti,
      exType: "PX",
      exValue: 60 * 60 * 24 * 365 * 1000 - (Date.now() - tokenData.iat * 1000), // Set the expiration time for the revoked token (e.g., 1 year from now) minus the time that has already passed since the token was issued
    });
  }
}

export async function updatePassword(bodyData , userData) {
  const { newPassword, oldPassword } = bodyData;
  // Here you would typically verify the old password, hash the new password, and update it in the database
  const { password } = userData;
  const isOldPasswordValid = await compareOperation({
    plainValue: oldPassword,
    hashvalue: password,
  });

  if (!isOldPasswordValid) {
    return badRequestException("Old password is incorrect");
  }
  const hashedNewPassword = await hashOperation({
    plainValue: newPassword,
    rounds: SALT_ROUNDS,
  });
  await DBRepo.updateOne({
    model: UserModel,
    filters: { _id: userData.id },
    updateData: { password: hashedNewPassword },
    changeCreditTime: new Date(), // This will invalidate all existing tokens for the user by updating the changeCreditTime field in the user's record, and then in the token verification process we will check if the token's iat (issued at) time is before or after the changeCreditTime, if it's before then the token is valid, but if it's after then the token is invalid because it was issued before the password change and we want to force the user to log in again with the new password to get a new token that reflects the password change and this will help to enhance security by ensuring that any potentially compromised tokens are invalidated immediately after a password change.
  });
  return { message: "Password updated successfully" };
}
