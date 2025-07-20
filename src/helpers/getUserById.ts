import axios from "axios";

export const getUserById = async (userId: string, accessToken: string) => {
  const url = `https://graph.microsoft.com/v1.0/users/${userId}?$select=id,displayName,mail,extension_79f1f183cd564ce3b792d1fa611d8075_Role`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.data;
};
