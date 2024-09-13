import { env } from "~/env";
import makeFetchCookie from "fetch-cookie";

export const CF_API_HEADER = {
  "Connection-Key": env.CF_API_KEY,
};

export const fetchSession = makeFetchCookie(fetch);
