import UserModel from "./../../DB/Models/User.model.js";
import * as DBRepo from "../../DB/db.repository.js";
import {
  badRequestException,
  conflictException,
  notFoundException,
} from "../../Common/Response/response.js";
import {
  SALT_ROUNDS,
  ENCRYPTION_KEY,
  GOOGLE_CLIENT_ID,
} from "../../../config/config.service.js";
import { compareOperation, hashOperation } from "../../Common/Security/hash.js";
import CryptoJS from "crypto-js";
import {
  generateAccessAndRefreshToken,
} from "../../Common/Security/token.js";

import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../Common/Enums/user.enums.js";

import { encryptvalue } from "../../Common/Security/encrpt.js";
import { generateOTP } from "../../Common/OTP/otb.service.js";
import { sendEmail } from "../../Common/email/email.config.js";
import { EmailEnum } from "../../Common/Enums/email.enums.js";

import * as redisServices from "../../DB/redis.service.js";

async function SendEmailOTP({ email, emailType , subject }) {
  const previousOTPttl = await redisServices.ttl({ key: redisServices.getOTPKey({ email, emailType }) });
  if (previousOTPttl > 0) {
    return badRequestException(`Please wait ${previousOTPttl} seconds before requesting a new OTP`);
  }

  const isBlocked = await redisServices.exists({ key: redisServices.getOTPReqBlockedKey({ email, emailType }) });
  if (isBlocked) {
    return badRequestException("You have reached the maximum number of OTP resend attempts. Please try again after 10 minutes.");
  }

  const reqNo = await redisServices.get({ key: redisServices.getOTPReqNoKey({ email, emailType }) });

  if (reqNo == 5) {
    await redisServices.set({
      key: redisServices.getOTPReqBlockedKey({ email, emailType }),
      value: 1,
      exValue: 10 * 60, // Block the user from requesting a new OTP for 10 minutes after 5 failed attempts
    });
    return badRequestException("You have reached the maximum number of OTP resend attempts. Please try again after 10 minutes.");
  }

  const generatedOTP = generateOTP();

  await sendEmail({
    to: email,
    subject: subject,
    html: `<p>Your OTP for email confirmation is: <strong>${generatedOTP}</strong></p>`,
  });

  await redisServices.set({
    key: redisServices.getOTPKey({ email, emailType }),
    value: await hashOperation({ plainValue: generatedOTP, rounds: SALT_ROUNDS }),
    exValue: 120, // OTP expires in 2 minutes
  });

  await redisServices.incr({ key: redisServices.getOTPReqNoKey({ email, emailType }) });
} 

export async function signup(bodyData) {
  const { password, email } = bodyData;

  // Check if email already exists
  const existingUser = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  if (existingUser) {
    return conflictException("Email already exists");
  }

  const hashedPassword = await hashOperation({
    plainValue: password,
    rounds: SALT_ROUNDS,
  });
  bodyData.password = hashedPassword;

  if (bodyData.phone) {
    const phoneEncrypted = encryptvalue({ value: bodyData.phone });
    bodyData.phone = phoneEncrypted;
  }

  // Create user
  const user = await DBRepo.create({
    model: UserModel,
    inserteddata: bodyData,
  });

  // const otp = generateOTP();
  // await sendEmail({
  //   to: email,
  //   subject: EmailEnum.CONFIRM_EMAIL,
  //   html: `<p>Your OTP for email confirmation is: <strong>${otp}</strong></p>`,
  // });

  // await redisServices.set({
  //   key: redisServices.getOTPKey({ email, emailType: EmailEnum.CONFIRM_EMAIL }),
  //   value: await hashOperation({ plainValue: otp, rounds: SALT_ROUNDS }),
  //   exValue: 120, // OTP expires in 2 minutes
  // })

  // await redisServices.set({
  //   key: redisServices.getOTPReqNoKey({ email, emailType: EmailEnum.CONFIRM_EMAIL }),
  //   value: 1,
  //   exValue: 60 *20, // This key is used to track the number of OTP resend attempts. It expires after 20 minutes, which means the user can only attempt to resend the OTP a certain number of times within that period. After 20 minutes, the count will reset, allowing the user to attempt resending the OTP again if needed.
  // })

    await SendEmailOTP({ email, emailType: EmailEnum.CONFIRM_EMAIL , subject: EmailEnum.CONFIRM_EMAIL });

  return user;
}

export async function confirmEmail(bodyData) {
  const { email, otp } = bodyData;

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email, confirmEmail: false },
  });
  if (!user) {
    return badRequestException("Invalid email or email already confirmed");
  }

  const storedOTP = await redisServices.get({ key: redisServices.getOTPKey({ email, emailType: EmailEnum.CONFIRM_EMAIL }) });
  if (!storedOTP) {
    return badRequestException("OTP has expired, please request a new one");  
  }
    const isOTPValid = await compareOperation({
    plainValue: otp,
    hashvalue: storedOTP,
  });

  if (!isOTPValid) {
    return badRequestException("Invalid OTP");
  }

  // await DBRepo.updateOne({
  //   model: UserModel,
  //   filters: { email },
  //   updateData: { confirmEmail: true },
  // });

  // Another way to update the user document and set confirmEmail to true is to modify the user document directly and then save it back to the database. This approach allows you to work with the user document as a whole and make multiple changes if needed before saving it back to the database. Here's how you can do it:
  user.confirmEmail = true;
  // .save() is used to save the changes made to the user document back to the database. It will trigger any pre-save hooks defined in the UserModel schema, and it will also ensure that the updated user document is persisted in the database. This is necessary to actually update the user's confirmEmail field to true in the database after modifying it in the code. 
  await user.save();

  // After confirming the email, you can choose to delete the OTP from Redis since it's no longer needed. This will help keep your Redis store clean and free of expired OTPs. You can do this by calling the redisServices.del method with the appropriate key:
  // await redisServices.del({ key: redisServices.getOTPKey({ email, emailType: EmailEnum.CONFIRM_EMAIL }) });

  return { message: "Email confirmed successfully" };

}

export async function resendConfirmationEmailOTP(email) {
  await SendEmailOTP({ email, emailType: EmailEnum.CONFIRM_EMAIL , subject: "Resend OTP another time" });
  return { message: "OTP resent successfully" };
}

export async function resendForgetPasswordOTP(email) {
  await SendEmailOTP({ email, emailType: EmailEnum.FORGET_PASSWORD , subject: "Resend OTP another time" });
  return { message: "OTP resent successfully" };
}

export async function sendOTPForgetPassword(email) {
  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  
  if (!user) {
    return; // we don't want to reveal whether the email exists in our system or not, so we will just return without doing anything if the user is not found, this way we can prevent potential attackers from using this endpoint to enumerate valid email addresses in our system and it also helps to protect user privacy by not disclosing whether an email address is registered or not.
  }

  if (!user.confirmEmail) {
    return badRequestException("Please confirm your email before requesting a password reset");
  }

  await SendEmailOTP({ email, emailType: EmailEnum.FORGET_PASSWORD , subject: "Reset your password" });
}

export async function verifyOTPForgetPassword(bodyData) {
  const { email, otp } = bodyData;
  const storedOTP = await redisServices.get({ key: redisServices.getOTPKey({ email, emailType: EmailEnum.FORGET_PASSWORD }) });
  if (!storedOTP) {
    return badRequestException("OTP has expired, please request a new one");
  }
    const isOTPValid = await compareOperation({
    plainValue: otp,
    hashvalue: storedOTP,
  });

  if (!isOTPValid) {
    return badRequestException("Invalid OTP");
  }

}

export async function resetPassword(bodyData) {
  const { email, newPassword, otp } = bodyData;
  
  await verifyOTPForgetPassword({ email, otp });
  
  const hashedPassword = await hashOperation({
    plainValue: newPassword,
    rounds: SALT_ROUNDS,
  });
  
  await DBRepo.updateOne({
    model: UserModel,
    filters: { email },
    updateData: { password: hashedPassword },
  });

  return { message: "Password reset successfully" };
}

export async function login(bodyData) {
  const { email, password } = bodyData;
  // Check if email exists
  const existingUser = await DBRepo.findOne({
    model: UserModel,
    filters: { email },
  });
  if (!existingUser) {
    return notFoundException("Invalid email or password");
  }

  if(!existingUser.confirmEmail){
    return badRequestException("Please confirm your email before logging in");
  }

  // Check if password is correct
  const isPasswordValid = await compareOperation({
    plainValue: password,
    hashvalue: existingUser.password,
  });
  if (!isPasswordValid) {
    return notFoundException("Invalid email or password");
  }

  // const bytes  = CryptoJS.AES.decrypt(existingUser.phone, ENCRYPTION_KEY);
  // const originalPhone = bytes.toString(CryptoJS.enc.Utf8);
  // existingUser.phone = originalPhone;

  // const access_token = jwt.sign({ sub: existingUser._id },"secretkey",{
  //     // no time stamp
  //     noTimestamp: true, // This option is used to include the "iat" (issued at) claim in the token, which indicates when the token was issued. Setting it to false will exclude this claim from the token. the token will be smaller in size, but you won't have the information about when the token was issued. This can be useful in certain scenarios where you don't need to track the token's issuance time, but it may not be suitable for all use cases, especially if you want to implement token expiration or other time-based features.
  //     // subject:"123", // This option is used to set the "sub" (subject) claim in the token, which is typically used to identify the user or entity that the token represents. In this case, it is set to "123". You can replace this value with the actual user ID or any other identifier that you want to associate with the token. The "sub" claim is a standard claim in JWTs and can be used by the server to identify the user when the token is sent back in subsequent requests.
  //     subject: existingUser._id.toString(), // This option is used to set the "sub" (subject) claim in the token, which is typically used to identify the user or entity that the token represents. In this case, it is set to the string representation of the user's ID. You can replace this value with any other identifier that you want to associate with the token. The "sub" claim is a standard claim in JWTs and can be used by the server to identify the user when the token is sent back in subsequent requests.
  //     //both options subject and sub can not be used together, they are the same thing, you can use either one of them to set the subject claim in the token. If you use both options, the last one will overwrite the previous one. So in this case, the "sub" claim will be set to "123" and the "subject" claim will be ignored.
  //     expiresIn: "1h", // This option is used to set the expiration time of the token. In this case, it is set to "1h", which means the token will expire in 1 hour. You can adjust this value based on your application's requirements. After the token expires, it will no longer be valid and the user will need to log in again to obtain a new token. Setting an appropriate expiration time is important for security reasons, as it limits the window of opportunity for an attacker to use a stolen token.
  //     notBefore: "10s", // This option is used to set the "nbf" (not before) claim in the token, which indicates the time before which the token should not be accepted for processing. In this case, it is set to "10s", which means the token will not be valid until 10 seconds after it is issued. This can be useful to prevent tokens from being used immediately after they are issued, adding import { getOTPReqNoKey } from './../../DB/redis.service';
//  an extra layer of security. You can adjust this value based on your application's requirements. If a token is received before the specified "not before" time, it will be rejected by the server.import { async } from './../User/user.services';

  //     issuer: "http://localhost:5000", // This option is used to set the "iss" (issuer) claim in the token, which identifies the principal that issued the token. In this case, it is set to "yourappname". You can replace this value with the actual name of your application or any other identifier that you want to associate with the token's issuer. The "iss" claim is a standard claim in JWTs and can be used by the server to verify that the token was issued by a trusted source. When validating the token, the server can check if the "iss" claim matches the expected issuer value to ensure that the token is legitimate.
  //     issuer: `$req.protocol://${req.get("host")}`, // This option is used to set the "iss" (issuer) claim in the token, which identifies the principal that issued the token. In this case, it is set to a dynamic value that combines the request protocol and host, resulting in a URL like "http://localhost:3000". You can adjust this value based on your application's requirements. The "iss" claim is a standard claim in JWTs and can be used by the server to verify that the token was issued by a trusted source. When validating the token, the server can check if the "iss" claim matches the expected issuer value to ensure that the token is legitimate.
  //     audience: ["orders_server", "mail_server"] // This option is used to set the "aud" (audience) claim in the token, which identifies the recipients that the token is intended for. In this case, it is set to an array of strings ["orders_server", "mail_server"]. You can replace these values with the actual identifiers of the services or resources that are allowed to accept the token. The "aud" claim is a standard claim in JWTs and can be used by the server to verify that the token is being used by an intended recipient. When validating the token, the server can check if the "aud" claim contains its own identifier to ensure that it is authorized to accept the token.

  // });

  // const { accessSignatureKey, refreshSignatureKey } = getSignatureKeyByRole(
  //   existingUser.role,
  // );

  // const access_token = generateToken({
  //   signatureKey: accessSignatureKey,
  //   options: {
  //     audience: [existingUser.role, TokenType.ACCESS],
  //     expiresIn: 60 * 15,
  //     subject: existingUser._id.toString(),
  //   },
  // });

  // // refresh token is used to get a new access token when the current access token expires.
  // // It is typically long-lived and can be stored securely on the client side. When the access token expires, the client can send the refresh token to the server to request a new access token without requiring the user to log in again.
  // // This allows for a better user experience while maintaining security. The refresh token should be kept secure and should not be exposed to unauthorized parties, as it can be used to obtain new access tokens.

  // const refresh_token = generateToken({
  //   signatureKey: refreshSignatureKey,
  //   options: {
  //     audience: [existingUser.role, TokenType.REFRESH],
  //     expiresIn: "1y",
  //     subject: existingUser._id.toString(),
  //   },
  // });

  return generateAccessAndRefreshToken(existingUser);
}

async function verifyGoogleToken(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: GOOGLE_CLIENT_ID, 
  });
  const payload = ticket.getPayload();

  return payload;
}

export async function loginWithGoogle(idToken) {
  const payloadGoogleToken = await verifyGoogleToken(idToken);
  if (!payloadGoogleToken.email_verified) {
    return badRequestException("Email not verified by Google");
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email: payloadGoogleToken.email, provider: ProviderEnum.Google },
  });

  if (!user) {
    return signupWithGmail(idToken);
  }

  const { access_token, refresh_token } = generateAccessAndRefreshToken(user);
  return { access_token, refresh_token };
}

export async function signupWithGmail(idToken) {
  // const { idToken } = bodyData;
  const payloadGoogleToken = await verifyGoogleToken(idToken);
  if (!payloadGoogleToken.email_verified) {
    return badRequestException("Email not verified by Google");
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filters: { email: payloadGoogleToken.email },
  });

  if (user) {
    if (user.provider !== ProviderEnum.System) {
      return badRequestException("Email already exists , sign in with your Email and password");
    }
    return { status: 200, result: await loginWithGoogle(idToken) };
  }

  const newUser = await DBRepo.create({
    model: UserModel,
    inserteddata: {
      email: payloadGoogleToken.email,
      userName: payloadGoogleToken.name,
      profileImage: payloadGoogleToken.picture,
      provider: ProviderEnum.Google,
      confirmEmail: true,
    },
  });
  
  // const { access_token, refresh_token } = generateAccessAndRefreshToken(newUser);

  return { status: 201, result: generateAccessAndRefreshToken(newUser) };
}


