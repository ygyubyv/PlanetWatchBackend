import axios from "axios";
import { getFormatedExtension } from "./getFormatedExtension";

export const getUserById = async (userId: string, accessToken: string) => {
  const url = `https://graph.microsoft.com/v1.0/users/${userId}?$select=id,displayName,mail,${getFormatedExtension(
    "Role"
  )}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
