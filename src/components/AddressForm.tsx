import { STATE_ABBREVIATIONS } from "@/lib/consts";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { EllipsisVertical, Pencil, Save, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormCtx } from "./forms/FormContext";
import FormSelect from "./forms/FormSelect";
import { FormTextInput } from "./forms/FormTextInput";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Form } from "./ui/form";

export type Address = {
  id: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
};

export default function AddressForm({
  patientId,
  address,
  isCreating,
  isOnlyAddress,
  setIsCreating,
}: {
  address: Address | null;
  patientId: string;
  isCreating: boolean;
  isOnlyAddress: boolean;
  setIsCreating?: (isCreating: boolean) => void;
}) {
  const utils = api.useUtils();
  const addressFormSchema = z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string().regex(/^\d{5}$/),
    isPrimary: isOnlyAddress
      ? z.enum(["Yes"]).optional().default("Yes")
      : z.enum(["Yes", "No"]),
  });

  const addressDefaultValues: Partial<z.infer<typeof addressFormSchema>> = {
    line1: address?.line1 || "",
    line2: address?.line2 || "",
    city: address?.city || "",
    state: address?.state || "",
    zip: address?.zip || "",
  };

  if (address) {
    addressDefaultValues.isPrimary = address.isPrimary ? "Yes" : "No";
  }

  if (isOnlyAddress) {
    addressDefaultValues.isPrimary = "Yes";
  }

  const [isEditing, setIsEditing] = useState(isCreating);

  useEffect(() => {
    if (addressDefaultValues && !isEditing) {
      form.reset(addressDefaultValues);
    }
  }, [address, isEditing]);

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressDefaultValues,
  });

  const createAddressMutation = api.address.create.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      return utils.patient.invalidate();
    },
  });

  const updateAddressMutation = api.address.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      return utils.patient.invalidate();
    },
  });

  const deleteAddressMutation = api.address.delete.useMutation({
    onSuccess: () => {
      return utils.patient.invalidate();
    },
  });

  const onDelete = () => {
    deleteAddressMutation.mutate(address?.id || "");
  };

  const onSubmit = (data: z.infer<typeof addressFormSchema>) => {
    if (isCreating) {
      createAddressMutation.mutate({ ...data, patientId });
      setIsCreating?.(false);
    } else {
      updateAddressMutation.mutate({
        id: address?.id || "",
        ...data,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        {!isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger className="self-end">
              <EllipsisVertical className="h-5 w-5 " />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="flex flex-row gap-2"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-4 w-4" />
                <p>Edit</p>
              </DropdownMenuItem>
              {!isOnlyAddress && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex flex-row gap-2"
                >
                  <Trash className="h-4 w-4" />
                  <p>Delete</p>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="flex flex-col">
        <FormCtx.Provider value={{ isEditing, form }}>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className=" grid grid-cols-3 gap-6">
                <FormTextInput name="line1" label="Address line 1" />
                <FormTextInput name="line2" label="Address line 2" />
                <FormTextInput name="city" label="City" />
                <FormSelect
                  name="state"
                  label="State"
                  placeholder="Select a state"
                  options={STATE_ABBREVIATIONS.map((abbr) => ({
                    label: abbr,
                    value: abbr,
                  }))}
                />
                <FormTextInput name="zip" label="Zip code" />
                {
                  <FormSelect
                    name="isPrimary"
                    label="Primary address?"
                    options={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                    disabled={isOnlyAddress}
                  />
                }
              </div>
              {isEditing && (
                <div className="flex flex-row gap-2 self-end">
                  <Button
                    type="button"
                    variant="secondary"
                    loading={false}
                    icon={<X className="h-5 w-5" />}
                    onClick={() => {
                      if (isCreating) {
                        setIsCreating?.(false);
                      }
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={
                      createAddressMutation.isPending ||
                      updateAddressMutation.isPending
                    }
                    icon={<Save className="h-5 w-5" />}
                  >
                    Save
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </FormCtx.Provider>
      </CardContent>
    </Card>
  );
}
