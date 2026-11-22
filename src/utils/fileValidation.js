// Mirrors the backend limits (Backend/src/utils/fileValidation.js).
// The server also checks the real file content, this is only for fast feedback.
const MB = 1024 * 1024;

export const FILE_TYPE_CONFIG = {
  audio: {
    allowedMimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "audio/m4a", "audio/x-m4a", "audio/mp4"],
    allowedExtensions: [".mp3", ".wav", ".m4a"],
    maxSizeBytes: Number(import.meta.env.VITE_MAX_AUDIO_MB || 25) * MB,
    label: "audio",
    formatsLabel: "MP3, WAV, M4A",
    accept: ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4",
  },
  image: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 5 * MB,
    label: "image",
    formatsLabel: "JPG, PNG, WEBP",
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
  },
};

export function validateFile(file, type) {
  const config = FILE_TYPE_CONFIG[type];
  if (!config) return { valid: false, message: "Unsupported file category." };
  if (!file) return { valid: false, message: `Please choose a ${config.label} file.` };

  const extension = `.${(file.name || "").split(".").pop()?.toLowerCase()}`;
  const mimeOk = !file.type || config.allowedMimeTypes.includes(file.type);
  if (!mimeOk || !config.allowedExtensions.includes(extension)) {
    return { valid: false, message: `Unsupported file type. Allowed formats: ${config.formatsLabel}.` };
  }
  if (file.size > config.maxSizeBytes) {
    return { valid: false, message: `File is too large. Maximum size is ${config.maxSizeBytes / MB} MB.` };
  }
  return { valid: true };
}
