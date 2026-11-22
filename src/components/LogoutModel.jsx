import { ConfirmDialog } from "./ui/index.jsx";

// (File name kept for older imports.)
const LogoutModal = ({ isOpen, onClose, onConfirm }) => (
  <ConfirmDialog
    open={isOpen}
    title="Log out?"
    message="You will need to log in again to listen to your music."
    confirmLabel="Log out"
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);

export default LogoutModal;
