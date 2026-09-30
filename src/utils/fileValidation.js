export const FILE_TYPE_CONFIG = {
  audio: {
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/m4a",
      "audio/x-m4a",
    ],
    maxSizeBytes: 5 * 1024 * 1024,
    label: "audio",
    formatsLabel: "MP3, WAV, M4A",
  },
  image: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 15 * 1024 * 1024,
    label: "image",
    formatsLabel: "JPG, PNG, WEBP",
  },
};

export function validateFile(file, type) {
  const config = FILE_TYPE_CONFIG[type];

  if (!config) {
    return { valid: false, message: "Unsupported file category." };
  }

  if (!file) {
    return { valid: false, message: `Please select an ${config.label} file.` };
  }

  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      message: `Unsupported file type. Allowed formats: ${config.formatsLabel}.`,
    };
  }

  if (file.size > config.maxSizeBytes) {
    const maxMB = config.maxSizeBytes / (1024 * 1024);
    return {
      valid: false,
      message: `File is too large. Maximum allowed size is ${maxMB} MB.`,
    };
  }

  return { valid: true };
}
