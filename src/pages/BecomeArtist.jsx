import { useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaMicrophoneAlt, FaPlus, FaTimes, FaTimesCircle } from "react-icons/fa";
import { Badge, Button, Card, ConfirmDialog, Input, PageHeader, Skeleton, Textarea } from "../components/ui/index.jsx";
import { GENRES, genreLabel } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorCode, getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";

const isUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export default function BecomeArtist() {
  usePageTitle("Become an artist");
  const { user, hasArtistRole, switchRole, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [request, setRequest] = useState(undefined);
  const [form, setForm] = useState({ artistName: "", bio: "", genres: [], links: [], reason: "" });
  const [newLink, setNewLink] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get("/artist-requests/me")
      .then(({ data }) => setRequest(data.request))
      .catch(() => setRequest(null));
  }, []);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const toggleGenre = (g) => setForm((f) => ({ ...f, genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : f.genres.length >= 5 ? f.genres : [...f.genres, g] }));
  const addLink = () => {
    const value = newLink.trim();
    if (!value) return;
    if (!isUrl(value)) return setErrors((e) => ({ ...e, links: "Links must start with http:// or https://" }));
    if (form.links.length >= 3) return setErrors((e) => ({ ...e, links: "Up to 3 links" }));
    setForm((f) => ({ ...f, links: [...f.links, value] }));
    setNewLink("");
    setErrors((e) => ({ ...e, links: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.artistName.trim().length < 2) next.artistName = "Artist name must be at least 2 characters";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/artist-requests", { ...form, artistName: form.artistName.trim(), bio: form.bio.trim(), reason: form.reason.trim() });
      setRequest(data.request);
      showToast(data.message, "success");
      refreshUser();
    } catch (error) {
      const code = getErrorCode(error);
      if (code === "VALIDATION_ERROR" && Array.isArray(error.response?.data?.errors)) {
        const fieldErrors = {};
        error.response.data.errors.forEach((e) => (fieldErrors[String(e.path).split(".")[0]] = e.message));
        setErrors(fieldErrors);
      }
      showToast(getErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.delete("/artist-requests/me");
      setRequest(data.request);
      setConfirmCancel(false);
      showToast("Application cancelled", "success");
      refreshUser();
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setCancelling(false);
    }
  };

  if (request === undefined) return <Skeleton className="h-80 w-full max-w-3xl" />;

  const header = <PageHeader title="Become an artist" subtitle="Publish your music on Sonora" icon={FaMicrophoneAlt} />;

  if (hasArtistRole) {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <Card className="border-emerald-500/20 bg-emerald-500/5 text-center">
          <FaCheckCircle className="mx-auto text-4xl text-emerald-300" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-white">You are already an artist</h2>
          <Button className="mt-4" onClick={() => switchRole("artist")}>Open Artist Studio</Button>
        </Card>
      </div>
    );
  }

  if (request?.status === "pending") {
    return (
      <div className="mx-auto max-w-3xl">
        {header}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <FaClock className="mt-1 text-2xl text-amber-300" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-white">
                {request.artistName} <Badge tone="yellow">Pending review</Badge>
              </h2>
              <p className="mt-1 text-sm text-gray-400">Sent on {formatDate(request.createdAt)}. We will notify you when an admin reviews it.</p>
              {request.genres?.length > 0 && <p className="mt-2 text-sm text-gray-300">Genres: {request.genres.map(genreLabel).join(", ")}</p>}
              <Button variant="ghost" size="sm" className="mt-4" icon={FaTimes} onClick={() => setConfirmCancel(true)}>
                Cancel application
              </Button>
            </div>
          </div>
        </Card>
        <ConfirmDialog open={confirmCancel} title="Cancel your application?" message="You can apply again at any time." confirmLabel="Cancel application" cancelLabel="Keep it" loading={cancelling} onConfirm={cancel} onCancel={() => setConfirmCancel(false)} />
      </div>
    );
  }

  const cooldownActive = request?.status === "rejected" && request.cooldownEndsAt && new Date(request.cooldownEndsAt) > new Date();

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl">
      {header}
      {request?.status === "rejected" && (
        <Card className="mb-6 border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="mt-1 text-xl text-red-300" aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Your last application was not approved</p>
              {request.rejectionReason && <p className="mt-1 text-sm text-gray-300">Reason: {request.rejectionReason}</p>}
              {cooldownActive && <p className="mt-1 text-sm text-gray-400">You can apply again on {formatDate(request.cooldownEndsAt)}.</p>}
            </div>
          </div>
        </Card>
      )}
      {!user?.emailVerified && (
        <Card className="mb-6 border-amber-500/20 bg-amber-500/5 text-sm text-amber-200">Please verify your email first. You can resend the link from Settings.</Card>
      )}

      {!cooldownActive && (
        <form onSubmit={submit} noValidate>
          <Card className="space-y-5">
            <p className="text-sm text-gray-400">Tell us about your music. An admin reviews every application, usually within a few days.</p>
            <Input label="Artist name" required value={form.artistName} onChange={set("artistName")} maxLength={40} showCounter error={errors.artistName} />
            <Textarea label="Bio" value={form.bio} onChange={set("bio")} maxLength={500} rows={4} error={errors.bio} placeholder="Your style, influences, what you are working on" />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-300">Genres (up to 5)</legend>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)} aria-pressed={form.genres.includes(g)} className={`min-h-8 cursor-pointer rounded-full px-3 text-xs font-medium ${form.genres.includes(g) ? "bg-violet-500/30 text-white" : "border border-violet-500/20 text-gray-400 hover:text-white"}`}>
                    {genreLabel(g)}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-300">Sample links (SoundCloud, YouTube, Instagram... up to 3)</p>
              <ul className="mb-2 space-y-1">
                {form.links.map((link) => (
                  <li key={link} className="flex items-center justify-between gap-2 rounded-lg bg-gray-900/60 px-3 py-2 text-sm text-gray-300">
                    <span className="truncate">{link}</span>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, links: f.links.filter((l) => l !== link) }))} className="cursor-pointer text-gray-500 hover:text-red-300" aria-label={`Remove ${link}`}>
                      <FaTimes aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              {form.links.length < 3 && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://..." aria-label="Sample link" error={errors.links} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())} />
                  </div>
                  <Button variant="secondary" icon={FaPlus} onClick={addLink}>Add</Button>
                </div>
              )}
            </div>
            <Textarea label="Why do you want to join as an artist? (optional)" value={form.reason} onChange={set("reason")} maxLength={500} rows={3} />
            <div className="flex justify-end">
              <Button type="submit" size="lg" loading={submitting} disabled={!user?.emailVerified}>
                Send application
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
