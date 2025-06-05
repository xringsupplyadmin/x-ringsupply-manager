"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  loggerLink,
  unstable_httpBatchStreamLink,
  type TRPCClientErrorLike,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { UseTRPCMutationOptions } from "@trpc/react-query/shared";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import React, { useState } from "react";
import SuperJSON from "superjson";
import type { useToast } from "~/hooks/use-toast";

import { type AppRouter } from "~/server/api/root";

const createQueryClient = () => new QueryClient();

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

type StatusMessage<Type> = React.ReactNode | ((data: Type) => React.ReactNode);

function wrapRecursive(data: React.ReactNode): React.ReactNode {
  if (typeof data === "string") {
    return <span key={data}>{data}</span>;
  }
  if (Array.isArray(data)) {
    return data.map(wrapRecursive);
  }
  return data;
}

function evalStrFn<Type>(
  data: Type,
  strFn?: StatusMessage<Type>,
  fallback?: string,
) {
  fallback ??= "Non-fatal Internal Error: Creating result string failed";
  if (typeof strFn === "function") {
    try {
      return wrapRecursive(strFn(data));
    } catch {
      return fallback;
    }
  } else {
    return strFn ?? fallback;
  }
}

export function withToastStatus<
  In,
  Err extends TRPCClientErrorLike<AppRouter>,
  Out,
  Context,
>(
  toast: ReturnType<typeof useToast>,
  opts: {
    /** Description of the mutation. Will the shown as the title of the toast */
    description: string;
    /** Message shown on success.  */
    successMsg?: StatusMessage<Out>;
    errorMsg?: StatusMessage<Err>;
  },
  extra?: UseTRPCMutationOptions<In, Err, Out, Context>,
): UseTRPCMutationOptions<In, Err, Out, Context> {
  return {
    ...extra,
    onSuccess(data, variables, context) {
      const msg = evalStrFn(data, opts.successMsg, "Success!");
      toast.toast({
        variant: "success",
        title: `${opts.description} - Success!`,
        description: msg,
      });
      extra?.onSuccess?.(data, variables, context);
    },
    onError(err, variables, context) {
      const msg = evalStrFn(err, opts.errorMsg, err.message);
      toast.toast({
        variant: "destructive",
        title: `${opts.description} - Error!`,
        description: msg,
      });
      extra?.onError?.(err, variables, context);
    },
    onMutate(variables) {
      toast.toast({
        variant: "default",
        title: opts.description,
        description: "Processing...",
      });
      extra?.onMutate?.(variables);
      return undefined; // why? idk
    },
  };
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + "/api/trpc",
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react");
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
