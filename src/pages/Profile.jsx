import { useEffect, useMemo, useState } from "react";
import { FaCamera, FaCheckCircle, FaPlus, FaTimes, FaUser } from "react-icons/fa";
import PremiumBadge from "../components/PremiumBadge.jsx";
import { Avatar, Badge, Button, Card, Input, PageHeader, Textarea } from "../components/ui/index.jsx";
import { GENRES, genreLabel } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";
import { FILE_TYPE_CONFIG, validateFile } from "../utils/fileValidation.js";

const USERNAME_RULE = /^[a-zA-Z0-9_.]{3,30}$/;
const isUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const Profile = () => {
  usePageTitle("Profile");
  const { user, roles, updateUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const isArtist = roles.includes("artist");
  const profile = useMemo(() => user?.artistProfile || {}, [user?.artistProfile]);

  const [username, setUsername] = useState(user?.username || "");
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [genres, setGenres] = useState(profile.genres || []);
  const [links, setLinks] = useState(profile.links || []);
  const [newLink, setNewLink] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUsername(user?.username || "");
    setDisplayName(profile.displayName || "");
    setBio(profile.bio || "");
    setGenres(profile.genres || []);
    setLinks(profile.links || []);
  }, [user?.username, profile]);

  const avatarPreview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar), [avatarFile, user?.avatar]);
  const bannerPreview = useMemo(() => (bannerFile ? URL.createObjectURL(bannerFile) : profile.banner), [bannerFile, profile.banner]);

  const pick = (setter, key) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const check = validateFile(file, "image");
    setErrors((e) => ({ ...e, [key]: check.valid ? undefined : check.message }));
    if (check.valid) setter(file);
  };

  const addLink = () => {
    const value = newLink.trim();
    if (!value) return;
    if (!isUrl(value)) return setErrors((e) => ({ ...e, links: "Links must start with http:// or https://" }));
    if (links.length >= 3) return setErrors((e) => ({ ...e, links: "Up to 3 links" }));
    setLinks([...links, value]);
    setNewLink("");
    setErrors((e) => ({ ...e, links: undefined }));
  };

  const toggleGenre = (genre) => {
    setGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : prev.length >= 5 ? prev : [...prev, genre]));
  };

  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!USERNAME_RULE.test(username.trim())) nextErrors.username = "3-30 characters: letters, numbers, _ and . only";
    if (isArtist && displayName.trim() && displayName.trim().length < 2) nextErrors.displayName = "At least 2 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const form = new FormData();
    if (username.trim() !== user.username) form.append("username", username.trim());
    if (avatarFile) form.append("avatar", avatarFile);
    if (isArtist) {
      if (displayName.trim()) form.append("displayName", displayName.trim());
      form.append("bio", bio.trim());
      form.append("genres", JSON.stringify(genres));
      form.append("links", JSON.stringify(links));
      if (bannerFile) form.append("banner", bannerFile);
    }

    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", form);
      updateUser(data.user);
      setAvatarFile(null);
      setBannerFile(null);
      showToast("Profile saved", "success");
      refreshUser();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not save your profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl">
      <PageHeader title="Profile" subtitle="How other people see you on Sonora" icon={FaUser} />
      <form onSubmit={save} className="space-y-6" noValidate>
        <Card className="overflow-hidden p-0">
          {isArtist && (
            <div className="relative h-36 sm:h-44">
              {bannerPreview ? <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-linear-to-br from-violet-700/50 via-fuchsia-700/30 to-gray-900" />}
              <label className="absolute right-3 top-3 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-black/60 px-3 text-xs font-semibold text-white hover:bg-black/80">
                <FaCamera aria-hidden="true" /> Change banner
                <input type="file" accept={FILE_TYPE_CONFIG.image.accept} className="sr-only" onChange={pick(setBannerFile, "banner")} />
              </label>
            </div>
          )}
          <div className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-end ${isArtist ? "-mt-12" : ""}`}>
            <div className="relative w-fit">
              <Avatar src={avatarPreview} name={user?.username} size="xl" className="border-4 border-gray-900" />
              <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-500" aria-label="Change profile picture">
                <FaCamera aria-hidden="true" />
                <input type="file" accept={FILE_TYPE_CONFIG.image.accept} className="sr-only" onChange={pick(setAvatarFile, "avatar")} />
              </label>
            </div>
            <div>
              <p className="flex items-center gap-2 text-xl font-bold text-white">
                {isArtist ? displayName || user?.username : user?.username}
                {profile.verified && <FaCheckCircle className="text-sky-400" aria-label="Verified artist" />}
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {roles.map((r) => (
                  <Badge key={r} tone={r === "artist" ? "fuchsia" : r === "admin" ? "yellow" : "violet"}>{r}</Badge>
                ))}
                {user?.isPremium && <PremiumBadge />}
              </div>
              <p className="mt-1 text-xs text-gray-500">Member since {formatDate(user?.createdAt)}</p>
            </div>
          </div>
          {(errors.avatar || errors.banner) && <p role="alert" className="px-5 pb-4 text-xs text-red-400">{errors.avatar || errors.banner}</p>}
        </Card>

        <Card className="space-y-4">
          <h2 className="font-bold text-white">Account</h2>
          <Input label="Username" value={username} maxLength={30} onChange={(e) => setUsername(e.target.value)} error={errors.username} hint="Letters, numbers, _ and ." />
          <Input label="Email" value={user?.email || ""} disabled hint="Your email is private and never shown to other users." />
        </Card>

        {isArtist && (
          <Card className="space-y-4">
            <h2 className="font-bold text-white">Artist profile</h2>
            <Input label="Artist name" value={displayName} maxLength={40} showCounter onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} />
            <Textarea label="Bio" value={bio} maxLength={500} rows={4} onChange={(e) => setBio(e.target.value)} placeholder="Tell listeners about your music" />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-300">Genres (up to 5)</legend>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)} aria-pressed={genres.includes(g)} className={`min-h-8 cursor-pointer rounded-full px-3 text-xs font-medium ${genres.includes(g) ? "bg-violet-500/30 text-white" : "border border-violet-500/20 text-gray-400 hover:text-white"}`}>
                    {genreLabel(g)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-300">Links (up to 3)</p>
              <ul className="mb-2 space-y-1">
                {links.map((link) => (
                  <li key={link} className="flex items-center justify-between gap-2 rounded-lg bg-gray-900/60 px-3 py-2 text-sm text-gray-300">
                    <span className="truncate">{link}</span>
                    <button type="button" onClick={() => setLinks(links.filter((l) => l !== link))} className="cursor-pointer text-gray-500 hover:text-red-300" aria-label={`Remove ${link}`}>
                      <FaTimes aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              {links.length < 3 && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://..." aria-label="New link" error={errors.links} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())} />
                  </div>
                  <Button variant="secondary" icon={FaPlus} onClick={addLink}>Add</Button>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
