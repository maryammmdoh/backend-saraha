import express from "express";
import * as userservice from "./user.services.js";
import {
  notFoundException,
  successResponse,
} from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenType } from "../../Common/Enums/token.enums.js";
import { authorization } from "../../Middleware/Authorization/authorization.middleware.js";
import { RoleEnum } from "../../Common/Enums/user.enums.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  allowedFileFormats,
  localUpload,
} from "../../Common/Multer/multer.config.js";
import {
  CoverPictureUploadValidation,
  GetAnotherUserProfileSchema,
  ProfilePictureUploadValidation,
  UpdatePasswordSchema,
} from "./user.validation.js";

const userRouter = express.Router();

userRouter.post("/", (req, res) => {
  res.send("user route");
});
// done
userRouter.get("/get_user",
  authentication(),
  authorization([RoleEnum.Admin]),
  async (req, res) => {
    try {
      successResponse({ res, statusCode: 200, data: req.user });
    } catch (error) {
      return notFoundException(error.message || "Something went wrong");
    }
  },
);
// done
userRouter.post("/renew_token",

  authentication(TokenType.REFRESH),
  async (req, res) => {
    try {
      const tokens = await userservice.renewToken(req.user);
      successResponse({ res, statusCode: 200, data: tokens });
    } catch (error) {
      return notFoundException(error.message || "Something went wrong");
    }
  },
);
// done
userRouter.post("/upload_profile_picture",
  authentication(),
  localUpload({
    foldername: "User",
    allowedFormats: allowedFileFormats.img,
    fileSize: 20,
  }).single("profilePicture"),
  validation(ProfilePictureUploadValidation),
  async (req, res) => {
    try {
      const result = await userservice.uploadProfilePicture(
        req.user._id,
        req.file,
      );
      successResponse({ res, statusCode: 200, data: result });
    } catch (error) {
      return notFoundException(error.message || "Something went wrong");
    }
  },
);
// done
userRouter.post( "/upload_cover_picture",
  authentication(),
  localUpload({
    foldername: "User",
    allowedFormats: allowedFileFormats.img,
    fileSize: 20,
  }).array("coverPictures", 2),
  validation(CoverPictureUploadValidation),
  async (req, res) => {
    try {
      const result = await userservice.uploadCoverPicture(
        req.user._id,
        req.files,
      );
      successResponse({ res, statusCode: 200, data: result });
    } catch (error) {
      return notFoundException(error.message || "Something went wrong");
    }
  },
);
// done
userRouter.get("/share-profile/:profileId",
  validation(GetAnotherUserProfileSchema),
  async (req, res) => {
    try {
      const result = await userservice.getAnotherUserProfile(
        req.params.profileId,
      );
      successResponse({ res, statusCode: 200, data: result });
    } catch (error) {
      return notFoundException(error.message || "Something went wrong");
    }
  },
);
// done
userRouter.get("/logout", authentication(), async (req, res) => {
  try {
    await userservice.logout(
      req.user._id,
      req.tokenPayload,
      req.body.logoutOptions,
    );
    successResponse({ res, statusCode: 200, data: "Logged out successfully" });
  } catch (error) {
    return notFoundException(error.message || "Something went wrong");
  }
});
// done
userRouter.patch("/update-password", authentication(),
validation(UpdatePasswordSchema), async (req, res) => {
  try {
  await userservice.updatePassword(req.body, req.user);
    successResponse({ res, statusCode: 200, data: "Password updated successfully" });
  } catch (error) {
    return notFoundException(error.message || "Something went wrong");
  }
});

export default userRouter;
