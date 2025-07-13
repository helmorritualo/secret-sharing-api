import multer from "multer";
import path from "path";
import { Context, Next } from "hono";

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowedExt = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

const fileHandlerMiddleware = async (c: Context, next: Next) => {
  const req = c.req.raw;
  await new Promise((resolve, reject) => {
    // @ts-ignore
    upload.array("files")(req, {}, (err) =>
      err ? reject(err) : resolve(null)
    );
  });
  await next();
};

export default fileHandlerMiddleware;
