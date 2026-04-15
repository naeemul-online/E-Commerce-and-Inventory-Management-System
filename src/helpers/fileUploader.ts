import fs from "fs";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

async function uploadToCloudinary(file: Express.Multer.File) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      public_id: `${file.originalname}-${Date.now()}`,
      folder: "ecommerce/products",
      resource_type: "image",
    });

    return uploadResult;
  } finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
}

const upload = multer({ storage: storage });

export const fileUploader = {
  upload,
  uploadToCloudinary,
};