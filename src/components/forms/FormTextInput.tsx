import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useFormCtx } from "./FormContext";
import ReadOnlyFieldView from "./ReadOnlyFieldView";

export const FormTextInput = ({
  name,
  label,
  placeholder,
  type,
}: {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
}) => {
  const { form, isEditing } = useFormCtx();
  if (isEditing) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder ?? label}
                type={type}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  const value = form.getValues(name);

  return <ReadOnlyFieldView label={label} value={value} />;
};
