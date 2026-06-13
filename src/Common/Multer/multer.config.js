import { randomUUID } from "crypto";
import multer from "multer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

export const allowedFileFormats = {
  img: ["image/png", "image/jpg", "image/jpeg"],
  video: ["video/mp4", "video/mkv"],
  pdf: ["application/pdf"],
};

export function localUpload(
  { foldername = "GeneralFiles" },
  allowedFormats = allowedFileFormats.img,
  fileSize = 10,
) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = `./uploads/${foldername}`;
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
      cb(null, path.resolve(fullPath));
    },
    filename: function (req, file, cb) {
      const fileName = randomUUID() + "-" + file.originalname;
      file.finalPath = `uploads/${foldername}/${fileName}`; // we can assign the final path of the file to a property in the file object (e.g., finalPath) that is generated in the filename function of the multer storage configuration and this property will be available in the req.file object in the controller after the file is uploaded and we can use this property to save the file path in the database or to return it in the response after uploading the file and this way we can have access to the final path of the uploaded file without having to generate it again in the controller or in the service layer and we can ensure that the file path is consistent with the actual location of the uploaded file on the server
      cb(null, fileName);
    },
  });

 
  function fileFilter(req, file, cb) {
    if (!allowedFormats.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type", { cause: { statusCode: 400 } }),
        false,
      );
    }
    return cb(null, true);
  }

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: fileSize * 1024 * 1024 }, // fileSize is in MB, we convert it to bytes by multiplying it by 1024 * 1024
  });
  return upload;
}

