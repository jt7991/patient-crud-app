import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useFormCtx } from "./FormContext";
import ReadOnlyFieldView from "./ReadOnlyFieldView";

type FormSelectProps = {
  label: string;
  name: string;
  options: {
    value: string;
    label: string;
  }[];
  placeholder?: string;
  disabled?: boolean;
};

export default function FormSelect({
  label,
  name,
  options,
  placeholder,
  disabled,
}: FormSelectProps) {
  const { isEditing, form } = useFormCtx();

  if (isEditing) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  const value = form.getValues(name);

  return <ReadOnlyFieldView label={label} value={value} />;
}
