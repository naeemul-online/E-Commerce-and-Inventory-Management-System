import fs from "fs";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";

type UploadToCloudinaryOptions = {
  folder?: string;
};

const extractPublicIdFromCloudinaryUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const uploadSegment = "/upload/";
    const uploadIndex = parsedUrl.pathname.indexOf(uploadSegment);

    if (uploadIndex === -1) return null;

    let publicPath = parsedUrl.pathname.slice(uploadIndex + uploadSegment.length);
    publicPath = publicPath.replace(/^v\d+\//, "");

    const extensionIndex = publicPath.lastIndexOf(".");
    if (extensionIndex <= 0) return publicPath || null;

    return publicPath.slice(0, extensionIndex);
  } catch {
    return null;
  }
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

async function uploadToCloudinary(
  file: Express.Multer.File,
  options?: UploadToCloudinaryOptions,
) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      public_id: `${file.originalname}-${Date.now()}`,
      folder: options?.folder ?? "ecommerce/products",
      resource_type: "image",
    });

    return uploadResult;
  } finally {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
}

async function deleteFromCloudinary(imageUrl: string) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
  });

  const publicId = extractPublicIdFromCloudinaryUrl(imageUrl);
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}

const upload = multer({ storage: storage });

export const fileUploader = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};