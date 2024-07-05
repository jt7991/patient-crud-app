import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";

// Context for the form, so we don't have to pass shared info down the tree
export const FormCtx = createContext<{
  isEditing: boolean;
  form: UseFormReturn<any> | null;
}>({
  isEditing: false,
  form: null,
});

// Custom context hook for some better typing!
export const useFormCtx = () => {
  const ctx = useContext(FormCtx);
  const form = ctx.form;
  if (!form) {
    throw new Error("useFormContext must be used within a FormCtx.Provider");
  }
  return { ...ctx, form };
};
