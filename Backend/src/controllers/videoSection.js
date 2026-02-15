import { v2 as cloudinary } from 'cloudinary';
import Problem from "../models/problem.js";
import User from "../models/user.js";
import SolutionVideo from "../models/solutionVideo.js";
import { sanitizeFilter } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();  

// ✅ Cloudinary Configuration (CORRECT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// console.log("Cloudinary Loaded With:", {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
//   api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING"
// });

// =======================
// GENERATE UPLOAD SIGNATURE
// =======================
const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // ✅ FIXED: use cloudinary.utils via v2
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

// =======================
// SAVE VIDEO METADATA
// =======================
const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.user._id;

    // ✅ FIXED: use cloudinary.api via v2
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

    // ✅ Generate thumbnail
    const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id, {
      resource_type: "video",
      transformation: [
        { width: 400, height: 225, crop: "fill" },
        { quality: "auto" },
        { start_offset: "auto" }
      ],
      format: "jpg"
    });

    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });

    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};

// =======================
// DELETE VIDEO
// =======================
const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;

    const video = await SolutionVideo.findOneAndDelete({ problemId });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // ✅ FIXED: cloudinary.uploader via v2
    await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
      resource_type: 'video',
      invalidate: true
    });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

export { generateUploadSignature, saveVideoMetadata, deleteVideo };



// const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
    // resource_type: 'image',  
    // transformation: [
    // { width: 400, height: 225, crop: 'fill' },
    // { quality: 'auto' },
    // { start_offset: 'auto' }  
    // ],
    // format: 'jpg'
    // });