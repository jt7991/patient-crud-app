"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SaveIcon, TrashIcon, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const newFieldFormSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "number"]),
});

type NewFieldFormType = z.infer<typeof newFieldFormSchema>;

const NewFieldFormRow = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: NewFieldFormType) => void;
  onCancel: () => void;
}) => {
  const form = useForm<NewFieldFormType>({
    resolver: zodResolver(newFieldFormSchema),
  });

  const handleSubmit = async () => {
    if (await form.trigger()) {
      onSubmit(form.getValues());
    }
  };

  return (
    <Form {...form}>
      <TableRow key={"new-field"}>
        <TableCell>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => <Input {...field} />}
          />
        </TableCell>
        <TableCell>
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </TableCell>
        <TableCell>
          <div className="flex flex-row space-x-2">
            <Button
              variant="default"
              size="sm"
              icon={<SaveIcon className="h-4 w-4" />}
              onClick={handleSubmit}
            >
              Save
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </Form>
  );
};

export default function AdminPage() {
  const [addingField, setAddingField] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string>("");
  const fieldsQuery = api.fields.list.useQuery();
  const fields = fieldsQuery.data ?? [];

  const handleAddField = () => {
    setAddingField(true);
  };

  const handleCancelAddField = () => {
    setAddingField(false);
  };

  const createMutation = api.fields.create.useMutation({
    onSuccess: async () => {
      await fieldsQuery.refetch();
      setAddingField(false);
    },
  });

  const handleCreateField = (data: {
    name: string;
    type: "text" | "number";
  }) => {
    console.log("Submitting", data);
    createMutation.mutate(data);
  };

  const deleteMutation = api.fields.delete.useMutation({
    onSuccess: () => fieldsQuery.refetch(),
    onMutate: (id) => {
      // Used to show the loading spinner on the correct delete button
      setFieldToDelete(id);
    },
  });
  const handleDeleteField = (id: string) => deleteMutation.mutate(id);

  return (
    <div className="mx-auto w-full p-10">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Configure fields</h1>
          <h2 className="text-sm text-muted-foreground">
            View, edit, create, and delete your existing form fields to start
            collecting more patient data. These fields will be displayed in the
            "Additional information" section of the patient profile.
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>
                <TableCell>
                  {field.type[0]?.toUpperCase() + field.type.slice(1)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteField(field.id)}
                    icon={<TrashIcon className="h-4 w-4" />}
                    loading={
                      deleteMutation.isPending && fieldToDelete === field.id
                    }
                  ></Button>
                </TableCell>
              </TableRow>
            ))}
            {addingField && (
              <NewFieldFormRow
                onSubmit={handleCreateField}
                onCancel={handleCancelAddField}
              />
            )}
          </TableBody>
        </Table>
        {!addingField && (
          <div className="flex flex-row justify-end">
            <Button
              className="self-end"
              onClick={handleAddField}
              icon={<Plus className="h-4 w-4" />}
            >
              Add field
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
