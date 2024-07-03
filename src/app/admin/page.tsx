"use client";

import { Button } from "@/components/ui/button";
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
import { Plus, SaveIcon, TrashIcon, X } from "lucide-react";
import { useState } from "react";

const NewFieldForm = ({ onSubmit, onCancel }) => {
  return (
    <TableRow key={"new-field"}>
      <TableCell>
        <Input />
      </TableCell>
      <TableCell>
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-row space-x-2">
          <Button
            variant="default"
            size="sm"
            icon={<SaveIcon className="h-4 w-4" />}
            onClick={() => {}}
          >
            Save
          </Button>
          <Button
            variant="default"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default function AdminPage() {
  const [addingField, setAddingField] = useState(false);
  const handleAddField = () => {
    setAddingField(true);
  };
  const handleCancelAddField = () => {
    setAddingField(false);
  };
  const handleDeleteField = (id) => {};
  const handleEditField = (id, name, type) => {};
  const fields = [{ id: 1, name: "Name", type: "Text" }];

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
                <TableCell>{field.type}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {addingField && (
              <NewFieldForm
                onSubmit={handleAddField}
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
