import React from "react";
import { Button, type ButtonProps } from "~/components/ui/button";
import { Input, type InputProps } from "~/components/ui/input";
import { useFieldContext } from "~/lib/form";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { MultiSelect } from "~/components/ui/multi-select";

export const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "type">
>(({ children, ...props }, ref) => (
  <Button type="submit" ref={ref} {...props}>
    {children ?? "Submit"}
  </Button>
));
SubmitButton.displayName = "SubmitButton";

type FieldProps = {
  wrapperClassName?: string;
  labelClassName?: string;
  label?: string;
  required?: boolean;
};

type LabelProps = {
  required?: boolean;
};

function errorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null && "message" in e) {
    return `${e.message}`;
  } else {
    return `${e ?? "Unknown Error"}`;
  }
}

function ErrorDisplay() {
  const meta = useFieldContext().state.meta;
  if (!meta.isTouched || meta.isValid) return null;
  return (
    <div className={"flex flex-col gap-1 p-2 text-destructive"}>
      {meta.errors.map((e, i) => (
        <Label key={`error-${i}`}>{errorMessage(e)}</Label>
      ))}
    </div>
  );
}

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & LabelProps
>(({ children, className, required, ...props }, ref) => (
  <Label className={className} {...props} ref={ref}>
    {children}
    {required && <span className={"ml-1 text-destructive"}>*</span>}
  </Label>
));
FormLabel.displayName = "FormLabel";

export function RequiredFieldsIntro() {
  return (
    <Label asChild>
      <p className={"text-center"}>
        Fields marked with <span className={"text-destructive"}>*</span> are
        required
      </p>
    </Label>
  );
}

export const InputField = React.forwardRef<
  HTMLInputElement,
  InputProps & FieldProps
>(({ required, label, labelClassName, wrapperClassName, ...props }, ref) => {
  const field = useFieldContext<string>();
  return (
    <div className={wrapperClassName}>
      {label && (
        <FormLabel
          className={labelClassName}
          required={required}
          htmlFor={props.id}
        >
          {label}
        </FormLabel>
      )}
      <Input
        {...props}
        ref={ref}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <ErrorDisplay />
    </div>
  );
});
InputField.displayName = "InputField";

export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea"> & FieldProps
>(({ required, label, labelClassName, wrapperClassName, ...props }, ref) => {
  const field = useFieldContext<string>();
  return (
    <div className={wrapperClassName}>
      {label && (
        <FormLabel
          className={labelClassName}
          required={required}
          htmlFor={props.id}
        >
          {label}
        </FormLabel>
      )}
      <Textarea
        {...props}
        ref={ref}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <ErrorDisplay />
    </div>
  );
});
TextareaField.displayName = "TextareaField";

export const CheckboxField = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  React.ComponentPropsWithoutRef<typeof Checkbox> & FieldProps
>(({ required, label, labelClassName, wrapperClassName, ...props }, ref) => {
  const field = useFieldContext<boolean>();
  return (
    <div className={wrapperClassName}>
      <div className={"flex flex-row items-center gap-2"}>
        <Checkbox
          {...props}
          ref={ref}
          checked={field.state.value}
          onBlur={field.handleBlur}
          onCheckedChange={(e) => field.handleChange(e === true)}
        />
        {label && (
          <FormLabel
            className={labelClassName}
            required={required}
            htmlFor={props.id}
          >
            {label}
          </FormLabel>
        )}
      </div>
      <ErrorDisplay />
    </div>
  );
});
CheckboxField.displayName = "CheckboxField";

type Option = {
  label: string;
  value: string;
};
type Group = {
  label: string;
  options: Option[];
};
type SelectProps = FieldProps & {
  placeholder: string;
  options: (Option | Group | "separator")[];
};

export const SelectField = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger> & SelectProps
>(
  (
    {
      required,
      label,
      labelClassName,
      wrapperClassName,
      placeholder,
      options,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext<string>();
    return (
      <div className={wrapperClassName}>
        {label && (
          <FormLabel
            className={labelClassName}
            required={required}
            htmlFor={props.id}
          >
            {label}
          </FormLabel>
        )}
        <Select
          value={field.state.value}
          onOpenChange={(open) => !open && field.handleBlur()}
          onValueChange={(value) => field.handleChange(value)}
        >
          <SelectTrigger ref={ref} {...props}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => {
              if (option === "separator") {
                return <SelectSeparator key={`separator-${index}`} />;
              } else if ("options" in option) {
                return (
                  <SelectGroup key={option.label}>
                    <SelectLabel>{option.label}</SelectLabel>
                    {option.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              } else {
                return (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              }
            })}
          </SelectContent>
        </Select>
        <ErrorDisplay />
      </div>
    );
  },
);
SelectField.displayName = "SelectField";

export const MultiSelectField = React.forwardRef<
  React.ElementRef<typeof MultiSelect>,
  Omit<
    React.ComponentPropsWithoutRef<typeof MultiSelect>,
    "defaultValue" | "onValueChange"
  > &
    FieldProps
>(({ required, label, labelClassName, wrapperClassName, ...props }, ref) => {
  const field = useFieldContext<string[]>();
  const values = field.state.value.filter((v) =>
    props.options.some((o) => o.value === v),
  );
  if (values.length !== field.state.value.length) {
    console.warn("Invalid selection for MultiSelect!", field.state.value);
  }
  return (
    <div className={wrapperClassName}>
      {label && (
        <FormLabel
          className={labelClassName}
          htmlFor={props.id}
          required={required}
        >
          {label}
        </FormLabel>
      )}
      <MultiSelect
        defaultValue={values}
        onValueChange={field.handleChange}
        ref={ref}
        {...props}
      />
      <ErrorDisplay />
    </div>
  );
});
MultiSelectField.displayName = "MultiSelectField";
