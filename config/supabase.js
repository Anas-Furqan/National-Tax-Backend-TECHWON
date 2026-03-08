const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for backend

const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket name for consultation uploads
const CONSULTATION_BUCKET = 'consultation-uploads';

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Object} - { url, path, error }
 */
const uploadToSupabase = async (fileBuffer, fileName, mimeType) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `consultations/${timestamp}-${sanitizedName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(CONSULTATION_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { url: null, path: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(CONSULTATION_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    console.error('Upload error:', err);
    return { url: null, path: null, error: err.message };
  }
};

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - Path of file in bucket
 * @returns {Object} - { success, error }
 */
const deleteFromSupabase = async (filePath) => {
  try {
    if (!filePath) return { success: true, error: null };

    const { error } = await supabase.storage
      .from(CONSULTATION_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Delete error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  supabase,
  uploadToSupabase,
  deleteFromSupabase,
  CONSULTATION_BUCKET,
};
