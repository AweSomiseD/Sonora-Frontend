export const getDashboardPath = (role) => {
  if (role === "artist") return "/artist";
  if (role === "admin") return "/admin";
  return "/listener";
};

export const getDashboardChildPath = (role, childPath) => `${getDashboardPath(role)}/${childPath}`;
