import { useEffect, useState } from "react";
import { FaUserShield, FaBan, FaCheckCircle, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext.jsx";
import api from "../services/api.js";

const ROLE_OPTIONS = ["listener", "artist", "admin"];

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = async (searchValue = search, roleValue = roleFilter) => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (searchValue.trim()) params.search = searchValue.trim();
      if (roleValue) params.role = roleValue;

      const response = await api.get("/admin/users", { params });

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError(error.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search, roleFilter);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setPendingUserId(userId);

    try {
      const response = await api.patch(`/admin/users/${userId}/role`, {
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? response.data.user : u)),
      );
    } catch (error) {
      console.error("Failed to update role:", error);
      showToast(
        error.response?.data?.message || "Failed to update role.",
        "error",
      );
    } finally {
      setPendingUserId(null);
    }
  };

  const handleToggleBan = async (userId) => {
    setPendingUserId(userId);

    try {
      const response = await api.patch(`/admin/users/${userId}/ban`);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, isBanned: response.data.user.isBanned }
            : u,
        ),
      );
      showToast(response.data.message, "success");
    } catch (error) {
      console.error("Failed to toggle ban:", error);
      showToast(
        error.response?.data?.message || "Failed to update ban status.",
        "error",
      );
    } finally {
      setPendingUserId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setPendingUserId(deleteTarget._id);

    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);

      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast("User deleted successfully", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast(
        error.response?.data?.message || "Failed to delete user.",
        "error",
      );
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <>
      <div className="px-8 py-10">
        <p className="text-sm font-medium text-red-500">Admin Console</p>
        <h1 className="mt-1 text-3xl font-bold">Users</h1>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-500 sm:max-w-sm"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 sm:w-44"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role} className="capitalize">
                {role}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-gray-400">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  const isPending = pendingUserId === u._id;

                  return (
                    <tr
                      key={u._id}
                      className="border-b border-gray-800 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold">{u.username}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={u.role}
                          disabled={isSelf || isPending}
                          onChange={(e) =>
                            handleRoleChange(u._id, e.target.value)
                          }
                          className="rounded-lg border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm capitalize disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                            <FaBan className="text-xs" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                            <FaCheckCircle className="text-xs" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleBan(u._id)}
                            disabled={isSelf || isPending}
                            className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold transition hover:border-amber-500 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>

                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isSelf || isPending}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <FaUserShield className="text-2xl" />
                </div>
              </div>

              <h3 className="text-center text-xl font-bold">
                Delete this user?
              </h3>

              <p className="mt-2 text-center text-sm text-gray-400">
                This will permanently delete{" "}
                <span className="font-semibold text-white">
                  {deleteTarget.username}
                </span>
                's account. This cannot be undone.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl bg-gray-800 px-4 py-3 font-medium text-gray-200 transition hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
