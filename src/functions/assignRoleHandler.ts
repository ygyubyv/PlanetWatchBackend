import {
  app,
  HttpRequest,
  InvocationContext,
  HttpResponseInit,
} from "@azure/functions";
import { getFormatedExtension } from "../helpers/getFormatedExtension";
import { BASIC_AUTH } from "../../config";

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

  try {
    const body = await request.json();
    const existingRole = body[getFormatedExtension("Role")];

    if (existingRole) {
      return {
        status: 200,
        jsonBody: {
          version: "1.0.0",
          action: "Continue",
        },
      };
    }

    return {
      status: 200,
      jsonBody: {
        version: "1.0.0",
        action: "Continue",
        [getFormatedExtension("Role")]: "user",
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
