// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../utils.js/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "profilePics",
//     allowed_formats: ["jpg", "jpeg", "png"]
//   }
// });

// const upload = multer({ storage });
// export default upload;
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;
