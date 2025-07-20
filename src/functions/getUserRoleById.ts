import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { getAccessToken } from "../helpers/getAccessToken";
import { getUserById } from "../helpers/getUserById";

export async function getUserRoleById(
  req: HttpRequest
): Promise<HttpResponseInit> {
  const id = req.query.get("id");
  if (!id) {
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
        role: user[`extension_79f1f183cd564ce3b792d1fa611d8075_Role`] || "none",
      },
    };
  } catch (error: any) {
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
