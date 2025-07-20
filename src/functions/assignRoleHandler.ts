import {
  app,
  HttpRequest,
  InvocationContext,
  HttpResponseInit,
} from "@azure/functions";
import { getFormatedExtension } from "../helpers/getFormatedExtension";

export async function assignRoleHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
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
}

app.http("assignRole", {
  methods: ["POST"],
  authLevel: "function",
  handler: assignRoleHandler,
});
