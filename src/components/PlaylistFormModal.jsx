import { useEffect, useState } from "react";
import { getErrorCode, getErrorMessage } from "../services/api.js";
import { Button, Input, Modal, Textarea } from "./ui/index.jsx";

// Create or edit a playlist. `onSubmit(values)` must return a promise.
export default function PlaylistFormModal({ open, onClose, initial, title = "New playlist", submitLabel = "Create", onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || "");
    setDescription(initial?.description || "");
    setIsPublic(Boolean(initial?.isPublic));
    setError("");
  }, [open, initial]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setError("Name is required");
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), isPublic });
      onClose();
    } catch (err) {
      // Plan limit errors open the upgrade modal, so just close this one
      if (getErrorCode(err) === "PLAN_LIMIT") onClose();
      else setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="playlist-form" loading={saving}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="playlist-form" onSubmit={submit} className="space-y-4" noValidate>
        <Input label="Name" required autoFocus value={name} maxLength={60} showCounter onChange={(e) => setName(e.target.value)} error={error} />
        <Textarea label="Description" value={description} maxLength={300} rows={3} onChange={(e) => setDescription(e.target.value)} />
        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-300">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 accent-violet-500" />
          Public (anyone with the link who is logged in can view it)
        </label>
      </form>
    </Modal>
  );
}
