import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getAccessToken } from "../helpers/getAccessToken";
import { getUserById } from "../helpers/getUserById";
import { getFormatedExtension } from "../helpers/getFormatedExtension";

export async function getUserRoleById(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const id = req.query.get("id");

  if (!id) {
    context.error("Missing id query parameter");
    return {
      status: 400,
      body: "Missing id query parameter",
    };
  }

  try {
    const token = await getAccessToken();
    const user = await getUserById(id, token);

    return {
      status: 200,
      jsonBody: {
        id: user.id,
        displayName: user.displayName,
        mail: user.mail,
        role: user[getFormatedExtension("Role")] || "none",
      },
    };
  } catch (error: any) {
    context.error("Internal Server Error");
    return {
      status: 500,
      body: error.message || "Internal Server Error",
    };
  }
}

app.http("getUserRoleById", {
  methods: ["GET"],
  authLevel: "function",
  handler: getUserRoleById,
});
