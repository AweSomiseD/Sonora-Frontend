import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheck, FaCompactDisc, FaMusic } from "react-icons/fa";
import { Button, Card, EmptyState, Input, PageHeader, SkeletonList } from "../components/ui/index.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { FILE_TYPE_CONFIG, validateFile } from "../utils/fileValidation.js";

export const CreateAlbum = () => {
  usePageTitle("Create Album");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [songs, setSongs] = useState(null);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState([]);
  const [cover, setCover] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/music/my-music")
      .then(({ data }) => setSongs(data.items))
      .catch(() => setSongs([]));
  }, []);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Album title is required";
    if (cover) {
      const check = validateFile(cover, "image");
      if (!check.valid) nextErrors.cover = check.message;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const form = new FormData();
    form.append("title", title.trim());
    form.append("musics", JSON.stringify(selected));
    if (cover) form.append("coverImage", cover);

    setSaving(true);
    try {
      await api.post("/music/album", form);
      showToast("Album created", "success");
      navigate("/artist/my-albums");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not create the album"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl">
      <PageHeader title="Create Album" subtitle="Pick a title, a cover and your songs" icon={FaCompactDisc} />
      <Card>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Input label="Album title" value={title} maxLength={100} showCounter onChange={(e) => setTitle(e.target.value)} error={errors.title} required />
          <div>
            <label htmlFor="album-cover" className="text-sm font-medium text-gray-300">
              Cover image (optional)
            </label>
            <input id="album-cover" type="file" accept={FILE_TYPE_CONFIG.image.accept} onChange={(e) => setCover(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100" />
            {errors.cover && <p role="alert" className="mt-1 text-xs text-red-400">{errors.cover}</p>}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-300">
              Songs <span className="text-gray-500">({selected.length} selected)</span>
            </legend>
            {!songs ? (
              <SkeletonList count={4} />
            ) : songs.length === 0 ? (
              <EmptyState icon={FaMusic} title="Upload songs first" message="Albums are made from your own songs." action={<Link to="/artist/upload-music" className="font-semibold text-violet-300 hover:underline">Upload music</Link>} />
            ) : (
              <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-violet-500/10 p-2 scrollbar-thin">
                {songs.map((song) => {
                  const checked = selected.includes(song._id);
                  return (
                    <li key={song._id}>
                      <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 ${checked ? "bg-violet-500/15" : "hover:bg-white/5"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggle(song._id)} className="sr-only" />
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-violet-400 bg-violet-500 text-white" : "border-gray-600"}`} aria-hidden="true">
                          {checked && <FaCheck className="text-[10px]" />}
                        </span>
                        <span className="truncate text-sm text-white">{song.title}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>
          <Button type="submit" size="lg" className="w-full" loading={saving} icon={FaCompactDisc}>
            Create album
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateAlbum;
