import { useState } from "react";
import { Link } from "react-router-dom";
import { FaCog, FaCrown, FaEnvelope, FaGoogle, FaKey, FaSignOutAlt } from "react-icons/fa";
import { Badge, Button, Card, ConfirmDialog, PageHeader } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { formatDate } from "../utils/format.js";

function Row({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-violet-500/10 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Icon className="mt-1 text-violet-300" aria-hidden="true" />
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export const Settings = () => {
  usePageTitle("Settings");
  const { user, activeRole, logoutAll } = useAuth();
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  const send = async (path, label) => {
    setBusy(label);
    try {
      const { data } = await api.post(path, { email: user.email });
      showToast(data.message, "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy("");
    }
  };

  const isPremium = user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "past_due";

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Security and account options" icon={FaCog} />
      <Card>
        <Row icon={FaEnvelope} title="Email" description={user?.email}>
          {user?.emailVerified ? (
            <Badge tone="green">Verified</Badge>
          ) : (
            <Button variant="secondary" size="sm" loading={busy === "verify"} onClick={() => send("/auth/resend-verification", "verify")}>
              Resend verification
            </Button>
          )}
        </Row>
        <Row icon={FaGoogle} title="Sign-in method" description={user?.authProvider === "google" ? "Google account" : "Email and password"}>
          <Badge tone="gray">{user?.authProvider === "google" ? "Google" : "Password"}</Badge>
        </Row>
        <Row icon={FaKey} title={user?.hasPassword ? "Change password" : "Set a password"} description="We will email you a secure link.">
          <Button variant="secondary" size="sm" loading={busy === "reset"} onClick={() => send("/auth/forgot-password", "reset")}>
            Email me a link
          </Button>
        </Row>
        {activeRole !== "admin" && (
          <Row icon={FaCrown} title="Subscription" description={isPremium ? `Premium (${user?.subscriptionPlan})${user?.subscriptionCurrentPeriodEnd ? `, renews ${formatDate(user.subscriptionCurrentPeriodEnd)}` : ""}` : "Free plan"}>
            <Link to={getDashboardChildPath(activeRole, "pricing")} className="text-sm font-semibold text-violet-300 hover:underline">
              {isPremium ? "Manage" : "See Premium"}
            </Link>
          </Row>
        )}
        <Row icon={FaSignOutAlt} title="Log out everywhere" description="Ends your sessions on every device, including this one.">
          <Button variant="danger" size="sm" onClick={() => setConfirmLogoutAll(true)}>
            Log out all devices
          </Button>
        </Row>
      </Card>
      <ConfirmDialog
        open={confirmLogoutAll}
        title="Log out from all devices?"
        message="You will need to log in again on every device."
        confirmLabel="Log out everywhere"
        onConfirm={logoutAll}
        onCancel={() => setConfirmLogoutAll(false)}
      />
    </div>
  );
};

export default Settings;
