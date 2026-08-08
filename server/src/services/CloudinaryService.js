const cloudinary = require("../config/cloudinary");

/**
 * Uploads a file buffer to Cloudinary via an upload stream (works with
 * multer's memoryStorage so nothing touches disk).
 * @param {Buffer} buffer
 * @param {{ folder?: string, resourceType?: "image"|"video"|"auto" }} options
 * @returns {Promise<{ url: string, publicId: string, type: string }>}
 */
const uploadBuffer = (buffer, { folder = "jalrakshak/requests", resourceType = "auto" } = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          type: result.resource_type,
        });
      }
    );
    stream.end(buffer);
  });

const deleteAsset = (publicId, resourceType = "image") =>
  cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

module.exports = { uploadBuffer, deleteAsset };
