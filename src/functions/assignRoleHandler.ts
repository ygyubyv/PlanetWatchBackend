import {
  app,
  HttpRequest,
  InvocationContext,
  HttpResponseInit,
} from "@azure/functions";
import { getFormatedExtension } from "../helpers/getFormatedExtension";
import { BASIC_AUTH, OWNER } from "../../config";

interface AssignRoleRequestBody {
  email?: string;
  [key: string]: any;
}

const isAuthorized = (request: HttpRequest): boolean => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;

  const base64Credentials = authHeader.split(" ")[1];
  const [username, password] = Buffer.from(base64Credentials, "base64")
    .toString("utf-8")
    .split(":");

  const { username: BasicUsername, password: BasicPassword } = BASIC_AUTH;
  return username === BasicUsername && password === BasicPassword;
};

export const assignRoleHandler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> => {
  if (!isAuthorized(request)) {
    context.error("Unauthorized");
    return {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
      jsonBody: { error: "Unauthorized" },
    };
  }

  const { email: ownerEmail } = OWNER;

  try {
    const body = (await request.json()) as AssignRoleRequestBody;

    const userEmail = body.email?.toLowerCase();
    const existingRole = body[getFormatedExtension("Role")] || "";

    let roles = existingRole
      ? existingRole.split(",").map((r: string) => r.trim())
      : [];

    if (userEmail === ownerEmail.toLowerCase() && !roles.includes("owner")) {
      roles.push("owner");
    }

    if (roles.length === 0) {
      roles.push("user");
    }

    return {
      status: 200,
      jsonBody: {
        version: "1.0.0",
        action: "Continue",
        [getFormatedExtension("Role")]: roles.join(", "),
      },
    };
  } catch (err) {
    context.error("Error assigning role:", err);
    return {
      status: 500,
      jsonBody: {
        version: "1.0.0",
        action: "ValidationError",
        userMessage: "Could not assign role",
      },
    };
  }
};

app.http("assignRole", {
  methods: ["POST"],
  handler: assignRoleHandler,
});
