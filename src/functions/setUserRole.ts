import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import { getRolesFromToken } from "../auth/jwt/getRolesFromToken";
import { rolePermissions } from "../data/rolePermissions";
import { parseRolesFromString } from "../utils/roleConverters";
import { updateUserRoles } from "../graphApi/updateUserRoles";

interface SetUserRoleRequestBody {
  targetUserId: string;
  targetUserRoles: string;
}

export const setUserRole = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return {
      status: 401,
      jsonBody: { error: "No token provided" },
    };
  }

  const currentUserRoles = getRolesFromToken(token);

  const isOwner = currentUserRoles.includes("owner");
  const isAdmin = currentUserRoles.includes("admin");

  if (!isOwner && !isAdmin) {
    return {
      status: 403,
      jsonBody: { error: "Insufficient permissions" },
    };
  }

  try {
    const body = (await request.json()) as SetUserRoleRequestBody;
    const { targetUserId, targetUserRoles } = body;

    const allowedRoles = rolePermissions[isOwner ? "owner" : "admin"];

    const isAllowed = parseRolesFromString(targetUserRoles).every((role) =>
      allowedRoles.includes(role)
    );

    if (!isAllowed) {
      return {
        status: 403,
        jsonBody: { error: "You cannot assign some of these roles" },
      };
    }

    await updateUserRoles(targetUserId, targetUserRoles);

    return {
      status: 200,
      jsonBody: { success: true },
    };
  } catch (error) {
    context.error("Error assigning role");
    return {
      status: 500,
      jsonBody: { error: "Internal server error" },
    };
  }
};

app.http("setUserRole", {
  methods: ["POST"],
  handler: setUserRole,
  authLevel: "anonymous",
});
