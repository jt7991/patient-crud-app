"use client";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EditableSection } from "./EditableSection";
import FormSelect from "./forms/FormSelect";
import { FormTextInput } from "./forms/FormTextInput";

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
    .regex(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/, {
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

  const utils = api.useUtils();

  const onSubmit = () => {
    if (isCreatingPatient) {
      return createPatient.mutate(form.getValues(), {
        onSuccess: async (data) => {
          await utils.patient.getById.prefetch(data.id);
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
          return utils.patient.invalidate();
        },
      },
    );
  };

  return (
    <EditableSection
      name="Personal information"
      isEditing={isEditing}
      form={form}
      editOnClick={() => setIsEditing(true)}
      cancelOnClick={() => {
        setIsEditing(false);
        form.reset(patient);
      }}
      onSave={onSubmit}
      saving={createPatient.isPending || updatePatient.isPending}
    >
      <>
        <FormTextInput name="firstName" label="First name" placeholder="John" />
        <FormTextInput
          name="middleName"
          label="Middle name"
          placeholder="Anthony"
        />
        <FormTextInput name="lastName" label="Last name" placeholder="Smith" />
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
      </>
    </EditableSection>
  );
}
