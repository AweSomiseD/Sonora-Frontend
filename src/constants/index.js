// Mirrors Backend/src/config/constants.js and plans.js

export const GENRES = [
  "pop",
  "rock",
  "hip-hop",
  "rnb",
  "electronic",
  "dance",
  "jazz",
  "classical",
  "indie",
  "metal",
  "folk",
  "lofi",
  "ambient",
  "sufi",
  "qawwali",
  "ghazal",
  "punjabi",
  "bollywood",
  "other",
];

export const genreLabel = (genre) =>
  ({ "hip-hop": "Hip-Hop", rnb: "R&B", lofi: "Lo-fi" })[genre] ||
  (genre ? genre.charAt(0).toUpperCase() + genre.slice(1) : "Other");

export const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "copyright", label: "Copyright violation" },
  { value: "explicit", label: "Explicit content not marked" },
  { value: "abuse", label: "Abusive or hateful" },
  { value: "other", label: "Something else" },
];

// null = unlimited
export const PLAN_LIMITS = {
  listener: {
    free: { maxPlaylists: 3, skipsPerHour: 6 },
    premium: { maxPlaylists: null, skipsPerHour: null },
  },
  artist: {
    free: { maxPublishedTracks: 10, analyticsMaxRangeDays: 7, trackAnalytics: false },
    premium: { maxPublishedTracks: null, analyticsMaxRangeDays: 90, trackAnalytics: true },
  },
};

export const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: "At least 8 characters" },
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => /\d/.test(v), label: "One number" },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: "One special character" },
];

export const isStrongPassword = (value) => PASSWORD_RULES.every((rule) => rule.test(value || ""));
