import { Pencil, Save, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormCtx } from "./forms/FormContext";
import { Button } from "./ui/button";
import { Form } from "./ui/form";

export function EditableSection({
  name,
  isEditing,
  form,
  editOnClick,
  cancelOnClick,
  onSave,
  saving,
  children,
}: {
  name: string;
  isEditing: boolean;
  form: UseFormReturn<any>;
  editOnClick: () => void;
  cancelOnClick: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex  w-full flex-col px-10 pb-0 pt-10 ">
      <div className="flex flex-row justify-between border-b-2 border-b-primary">
        <h2 className="text-xl font-bold">{name}</h2>
        <Button
          size="sm"
          variant="ghost"
          className="flex flex-row gap-1"
          onClick={() => {
            if (isEditing) {
              return cancelOnClick();
            }
            return editOnClick();
          }}
        >
          {isEditing ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <Pencil className="h-5 w-5 text-primary" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <FormCtx.Provider value={{ isEditing, form }}>
        <Form {...form}>
          <form
            className="flex flex-col gap-6 p-2  pt-4"
            onSubmit={form.handleSubmit(onSave)}
          >
            <div className="grid w-full grid-cols-3 gap-6 ">{children}</div>
            {isEditing && (
              <Button
                type="submit"
                className="flex w-min flex-row gap-1 self-end text-sm "
                loading={saving}
                icon={<Save className="h-5 w-5" />}
              >
                Save
              </Button>
            )}
          </form>
        </Form>
      </FormCtx.Provider>
    </div>
  );
}
