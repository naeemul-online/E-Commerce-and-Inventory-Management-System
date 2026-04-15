import fs from "fs";
import multer from "multer";
import path from "path";

const uploadsPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");

  if (!isImage) {
    return cb(new Error("Only image files are allowed."));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});
