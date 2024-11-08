import e from "@/dbschema/edgeql-js";
import convert from "ansi-to-html";
import * as sass from "sass";
import { z } from "zod";
import client from "~/server/db/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const sortHeaders = e.shape(e.utils.SassHeader, (s) => ({
  order_by: [
    {
      expression: s.internal,
      direction: e.DESC,
    },
    s.includeOrder,
  ],
}));

async function getAllStylesheets(includeInternal: boolean) {
  const query = await e
    .select(e.utils.SassHeader, (s) => ({
      ...s["*"],
      ...sortHeaders(s),
      filter: includeInternal ? e.bool(true) : e.op(s.internal, "=", false),
    }))
    .run(client);
  return query;
}

async function getStylesheetMap(includeInternal: boolean) {
  const stylesheets = await getAllStylesheets(includeInternal);
  const content = new Map<string, string>();
  for (const s of stylesheets) {
    content.set(s.name, s.value);
  }
  return content;
}

function compileSass(contents: Map<string, string>) {
  const compileOptions: sass.StringOptions<"sync"> = {
    quietDeps: true,
    silenceDeprecations: ["import"],
    importers: [
      {
        canonicalize(url) {
          if (!url.startsWith("header:")) return null;
          return new URL(url);
        },
        load(canonicalUrl) {
          const content = contents.get(canonicalUrl.pathname);
          if (content === undefined) return null;
          return {
            contents: content,
            syntax: "scss",
          };
        },
      },
    ],
  };

  const keys = [];
  for (const key of contents.keys()) {
    keys.push(key);
  }

  const toCompile = keys.map((key) => `@import "header:${key}";`).join("\n");

  return sass.compileString(toCompile, compileOptions);
}

export const utilitiesRouter = createTRPCRouter({
  sass: {
    getAll: protectedProcedure.query(
      async ({
        ctx: {
          db: { e, client },
        },
      }) => {
        return await e
          .select(e.utils.SassHeader, (s) => ({
            id: true,
            name: true,
            internal: true,
            includeOrder: true,
            ...sortHeaders(s),
          }))
          .run(client);
      },
    ),
    getStylesheet: protectedProcedure
      .input(
        z.object({
          id: z.string().optional(),
        }),
      )
      .query(
        async ({
          ctx: {
            db: { e, client },
          },
          input: { id },
        }) => {
          return await e
            .select(e.utils.SassHeader, (s) => ({
              ...s["*"],
              filter_single: id ? e.op(s.id, "=", e.uuid(id)) : e.bool(false),
            }))
            .run(client);
        },
      ),
    saveStylesheet: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          value: z.string(),
        }),
      )
      .mutation(
        async ({
          ctx: {
            db: { e, client },
          },
          input: { id, value },
        }) => {
          return await e
            .update(e.utils.SassHeader, (s) => ({
              filter_single: e.op(s.id, "=", e.uuid(id)),
              set: {
                value: value,
              },
            }))
            .run(client);
        },
      ),
    createStylesheet: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          internal: z.boolean(),
        }),
      )
      .mutation(async () => {
        return "";
      }),
    compileCheck: protectedProcedure
      .output(
        z
          .object({
            success: z.literal(true),
            content: z.string(),
            error: z.undefined(),
          })
          .or(
            z.object({
              success: z.literal(false),
              content: z.undefined(),
              error: z.string().nullable(),
            }),
          ),
      )
      .query(async () => {
        try {
          const compiled = await compileSass(await getStylesheetMap(true));
          return {
            success: true,
            content: compiled.css,
          };
        } catch (ex) {
          if (ex instanceof sass.Exception) {
            const c = new convert();
            return {
              success: false,
              error: c.toHtml(ex.message),
            };
          } else {
            return {
              success: false,
              error: null,
            };
          }
        }
      }),
    getCombinedStylesheet: protectedProcedure.query(async () => {
      const stylesheets = await getAllStylesheets(false);
      const content = stylesheets
        .map((s) => `/** ${s.name}.scss */\n\n${s.value}\n`)
        .join("\n\n\n");

      return content;
    }),
  },
});
