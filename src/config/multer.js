import crypto from "crypto";
import multer from "multer";
import { extname, resolve } from "path";

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, "..", "..", "tmp", "uploads"),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, raw) => {
        if (err) return cb(err);

        return cb(null, raw.toString("hex") + extname(file.originalname));
      });
    },
  }),
};
