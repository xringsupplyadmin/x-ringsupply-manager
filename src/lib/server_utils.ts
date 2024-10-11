import type { objectTypeToSelectShape } from "@/dbschema/edgeql-js/select";
import type { ObjectTypeExpression } from "@/dbschema/edgeql-js/typesystem";
import makeFetchCookie from "fetch-cookie";
import { env } from "~/env";

export const CF_API_HEADER = {
  "Connection-Key": env.CF_API_KEY,
};

export const fetchSession = makeFetchCookie(fetch);

/**
 * Helper type to get the select shape of an object type
 */
export type SelectShape<
  Expr extends ObjectTypeExpression,
  Element extends Expr["__element__"] = Expr["__element__"],
> = objectTypeToSelectShape<Element>;
