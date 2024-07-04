import { cn } from "@/lib/utils";

export default function ReadOnlyFieldView({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <p
        className={cn({
          "text-sm text-foreground": !value,
          "text-foreground": value,
        })}
      >
        {value ? value : "No data"}
      </p>
    </div>
  );
}
