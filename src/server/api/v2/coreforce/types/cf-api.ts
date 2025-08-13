import { z } from "zod/v4";

const apiOptional = <Type extends z.ZodTypeAny>(t: Type) =>
  z.preprocess((obj) => {
    // Api returns optional types as empty strings (FP)
    if (typeof obj === "string" && obj.trim() === "") {
      return undefined;
    }

    return t.parse(obj);
  }, t.optional());
export const optNumber = apiOptional(z.coerce.number());
export const optString = apiOptional(z.string());
export const safeUrl = (fallback: string) =>
  z.preprocess((str) => {
    if (
      str === undefined ||
      str === null ||
      (typeof str === "string" && str.trim() === "")
    ) {
      return fallback;
    }

    const res = z.url().safeParse(str);
    if (res.success) {
      return res.data;
    } else {
      return fallback;
    }
  }, z.url());
export const dateEST = z.string().transform((str) => new Date(str + " EST"));
