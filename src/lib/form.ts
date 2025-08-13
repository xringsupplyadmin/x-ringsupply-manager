import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import {
  CheckboxField,
  InputField,
  MultiSelectField,
  SelectField,
  SubmitButton,
  TextareaField,
} from "~/components/form-components";

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldComponents: {
    InputField,
    CheckboxField,
    SelectField,
    MultiSelectField,
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useFieldContext, useFormContext };
