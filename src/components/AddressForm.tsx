import { STATE_ABBREVIATIONS } from "@/lib/consts";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormCtx } from "./forms/FormContext";
import FormSelect from "./forms/FormSelect";
import { FormTextInput } from "./forms/FormTextInput";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Form } from "./ui/form";

export type Address = {
  id: string;
  line1: string;
  line2?: string;
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
  setIsCreating: (isCreating: boolean) => void;
}) {
  const utils = api.useUtils();
  const addressFormSchema = z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string().regex(/^\d{5}$/),
    isPrimary: z.enum(["Yes", "No"]),
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

  useEffect(() => {
    if (addressDefaultValues && !isEditing) {
      form.reset(addressDefaultValues);
    }
  }, [addressDefaultValues]);

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: addressDefaultValues,
  });

  const [isEditing, setIsEditing] = useState(isCreating);
  const createAddressMutation = api.address.create.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      return utils.patient.invalidate();
    },
  });

  const onSubmit = (data: z.infer<typeof addressFormSchema>) => {
    if (isCreating) {
      createAddressMutation.mutate({ ...data, patientId });
      setIsCreating(false);
    } else {
      // Update address
    }
  };

  return (
    <Card>
      <CardContent>
        <FormCtx.Provider value={{ isEditing, form }}>
          <Form {...form}>
            <form
              className="flex flex-col gap-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className=" grid grid-cols-3 gap-6 pt-8">
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
                {!isOnlyAddress && (
                  <FormSelect
                    name="isPrimary"
                    label="Primary address?"
                    options={[
                      { label: "Yes", value: "Yes" },
                      { label: "No", value: "No" },
                    ]}
                  />
                )}
              </div>
              {isEditing && (
                <div className="flex flex-row self-end">
                  <Button
                    type="button"
                    variant="secondary"
                    loading={false}
                    icon={<X className="h-5 w-5" />}
                    onClick={() => {
                      if (isCreating) {
                        setIsCreating(false);
                      }
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={false}
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
