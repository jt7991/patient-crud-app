"use client";
import { Form } from "@/components/ui/form";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormCtx } from "./forms/FormContext";
import FormSelect from "./forms/FormSelect";
import { FormTextInput } from "./forms/FormTextInput";
import { Button } from "./ui/button";

const formSchema = z.object({
  firstName: z.string({
    message: "Required",
  }),
  middleName: z.string({
    message: "Required",
  }),
  lastName: z.string().nonempty({
    message: "Required",
  }),
  dob: z
    .string()
    .regex(/(0[1-9]|1[1,2])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}/, {
      message: "Must be in the form mm/dd/yyyy",
    }),
  status: z.enum(PATIENT_STATUSES),
});

type FormType = z.infer<typeof formSchema>;

type PatientEditFormProps = {
  patient?: FormType & { id: string };
};

export default function PatientEditForm({ patient }: PatientEditFormProps) {
  // If no patient is passed in, a patient is being created
  const isCreatingPatient = !patient;
  const [isEditing, setIsEditing] = useState(isCreatingPatient);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: patient,
  });

  const router = useRouter();

  const createPatient = api.patient.create.useMutation();
  const updatePatient = api.patient.update.useMutation();

  const onSubmit = () => {
    if (isCreatingPatient) {
      return createPatient.mutate(form.getValues(), {
        onSuccess: (data) => {
          setIsEditing(false);
          return router.push(`/patients/${data.id}`);
        },
      });
    }

    return updatePatient.mutate(
      { id: patient.id, ...form.getValues() },
      {
        onSuccess: () => {
          setIsEditing(false);
          return router.refresh();
        },
      },
    );
  };

  return (
    <div className="flex flex-col p-10">
      <div className="flex flex-row justify-between border-b-2 border-b-primary">
        <h2 className="text-xl font-bold">Personal information</h2>
        <Button
          size="sm"
          variant="ghost"
          className="flex flex-row gap-1"
          onClick={() => setIsEditing(!isEditing)}
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
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid w-full grid-cols-3 gap-6 ">
              <FormTextInput
                name="firstName"
                label="First name"
                placeholder="John"
              />
              <FormTextInput
                name="middleName"
                label="Middle name"
                placeholder="Anthony"
              />
              <FormTextInput
                name="lastName"
                label="Last name"
                placeholder="Smith"
              />
              <FormTextInput
                name="dob"
                label="Date of birth"
                placeholder="mm/dd/yyyy"
              />
              <FormSelect
                label="Status"
                name="status"
                options={PATIENT_STATUSES.map((status) => ({
                  value: status,
                  label: status,
                }))}
                placeholder="Select the patient's status"
              />
            </div>
            {isEditing && (
              <Button
                type="submit"
                className="flex w-min flex-row gap-1 self-end text-sm "
                loading={createPatient.isPending || updatePatient.isPending}
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
