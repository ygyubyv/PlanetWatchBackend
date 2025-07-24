export const rolePermissions: Record<string, string[]> = {
  owner: ["admin", "analyst", "researcher", "user"],
  admin: ["analyst", "researcher", "user"],
  analyst: [],
  researcher: [],
  user: [],
};
