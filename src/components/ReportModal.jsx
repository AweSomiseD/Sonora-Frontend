import { useState } from "react";
import { REPORT_REASONS } from "../constants/index.js";
import { useToast } from "../context/ToastContext.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { Button, Modal, Select, Textarea } from "./ui/index.jsx";

export default function ReportModal({ open, onClose, targetType, targetId, targetLabel }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      const { data } = await api.post("/reports", { targetType, targetId, reason, details });
      showToast(data.message, "success");
      setDetails("");
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "Could not send the report"), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Report ${targetLabel ? `"${targetLabel}"` : targetType}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={sending}>
            Send report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} options={REPORT_REASONS} />
        <Textarea label="Details (optional)" value={details} maxLength={500} rows={3} onChange={(e) => setDetails(e.target.value)} placeholder="Tell us what is wrong" />
        <p className="text-xs text-gray-500">Reports are private. Our team reviews every report.</p>
      </div>
    </Modal>
  );
}
