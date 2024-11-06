"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import SassEditor from "./_editor";

type DirtyState = Record<string, boolean>;

function EditorTab({ id }: { id: string }) {
  const { toast } = useToast();
  const toasts = useRef<{
    success?: () => void;
    error?: () => void;
  }>({
    success: undefined,
    error: undefined,
  });

  const trpc = api.useUtils();
  const stylesheet = api.utilities.sass.getStylesheet.useQuery({
    id: id,
  });
  const updateStylesheet = api.utilities.sass.saveStylesheet.useMutation();

  const [value, setValue] = useState<string>();
  const [unsaved, setUnsaved] = useState(false);

  const saveSuccess = useCallback(() => {
    setUnsaved(false);
    toasts.current.success?.();
    const { dismiss } = toast({
      title: "Changes saved!",
      duration: 3000,
    });
    toasts.current.success = dismiss;
    // Invalidate old data
    trpc.utilities.sass.compileCheck.invalidate();
    trpc.utilities.sass.getStylesheet.invalidate({
      id: id,
    });
  }, [
    setUnsaved,
    toast,
    id,
    trpc.utilities.sass.compileCheck,
    trpc.utilities.sass.getStylesheet,
  ]);

  const saveError = useCallback(() => {
    toasts.current.error?.();
    const { dismiss } = toast({
      title: "Error saving changes",
      variant: "destructive",
      duration: 10000,
    });
    toasts.current.error = dismiss;
  }, [toast]);

  const save = useCallback(() => {
    if (id === undefined || value === undefined) return;
    // Trigger the save
    updateStylesheet.mutate(
      {
        id,
        value,
      },
      {
        onSuccess: saveSuccess,
        onError: saveError,
      },
    );
  }, [id, value, updateStylesheet, saveSuccess, saveError]);

  if (stylesheet.data === undefined) {
    return <Loader2 className="animate-spin" />;
  }

  if (stylesheet.data === null) {
    return <p>Stylesheet not found</p>;
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-2">
        <p>
          Editing {stylesheet.data.name}{" "}
          <small className="italic text-muted-foreground">
            {unsaved ? "Unsaved changes" : "All changes saved"}
          </small>
        </p>
        <Button
          onClick={save}
          disabled={!unsaved || updateStylesheet.isPending}
          size="icon"
          variant="ghost"
        >
          {updateStylesheet.isPending ? (
            <Loader2 className="h-1/2 animate-spin" />
          ) : (
            <Save />
          )}
        </Button>
      </div>
      <SassEditor
        sheetId={id}
        defaultValue={stylesheet.data?.value ?? ""}
        onChange={(val) => {
          setUnsaved(true);
          setValue(val);
        }}
        width="100%"
      />
    </>
  );
}

const stylesheetSchema = z.object({
  name: z.string().min(1, {
    message: "Stylesheets must have a name",
  }),
  internal: z.boolean().default(false),
  includeOrder: z.number().optional(),
});

function StylesheetForm({
  onSubmit,
  children,
}: {
  onSubmit: (values: z.infer<typeof stylesheetSchema>) => void;
  children?: React.ReactNode;
}) {
  const form = useForm({
    resolver: zodResolver(stylesheetSchema),
    defaultValues: {
      name: "New Stylesheet",
      internal: false,
      includeOrder: undefined,
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Stylesheet name" {...field} />
              </FormControl>
              <FormDescription>
                This identifies the stylesheet in the combined output.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="internal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Internal</FormLabel>
                <FormDescription>
                  Internal stylesheets will not be included in the combined
                  output.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="includeOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Include Order</FormLabel>
              <FormControl>
                <Input type="number" placeholder="A number" {...field} />
              </FormControl>
              <FormDescription>
                Determines the order in which stylesheets are included in the
                combined output.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {children}
      </form>
    </Form>
  );
}

function CreateStylesheetForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const dismissLoading = useRef<() => void>();

  function createStylesheet(values: z.infer<typeof stylesheetSchema>) {
    console.log(values);
    dismissLoading.current?.();
    const { dismiss } = toast({
      title: `Creating stylesheet "${values.name}"`,
      description: (
        <p className="flex flex-row items-center justify-start gap-2">
          <Loader2 className="animate-spin" /> Please wait...
        </p>
      ),
      duration: 60000,
    });
    dismissLoading.current = dismiss;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button icon={<Plus />}>Create new stylesheet</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create new stylesheet</AlertDialogTitle>
        </AlertDialogHeader>
        <StylesheetForm onSubmit={createStylesheet}>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Create</AlertDialogAction>
          </AlertDialogFooter>
        </StylesheetForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function SassEditorPage() {
  const allSheets = api.utilities.sass.getAll.useQuery();
  const compileCheck = api.utilities.sass.compileCheck.useQuery();

  let pageContent;
  if (allSheets.data === undefined) {
    pageContent = (
      <p className="flex flex-row items-center justify-start gap-2">
        <Loader2 className="animate-spin" /> Loading editor...
      </p>
    );
  } else if (allSheets.data.length === 0) {
    pageContent = <CreateStylesheetForm />;
  } else {
    pageContent = (
      <div className="w-full">
        <Tabs
          defaultValue={allSheets.data[0]!.id}
          orientation="vertical"
          className="flex flex-row items-start justify-start gap-2"
        >
          <TabsList className="flex h-max flex-col items-stretch justify-center gap-2">
            {allSheets.data.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1">
            {allSheets.data.map((s) => (
              <TabsContent
                key={s.id}
                value={s.id}
                className="mt-0 data-[state=inactive]:hidden"
                forceMount
              >
                <EditorTab id={s.id} onUnsavedChange={() => {}} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-start gap-4">
      <h1 className="text-lg font-bold">Stylesheet Editor</h1>
      {pageContent}
    </div>
  );
}
