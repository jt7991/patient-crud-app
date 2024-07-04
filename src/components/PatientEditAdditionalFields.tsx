"use client";
import { api } from "@/trpc/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { EditableSection } from "./EditableSection";
import { FormTextInput } from "./forms/FormTextInput";

export default function PatientEditAdditionalFields({
  patientAdditionalInfo,
  patientId,
}: {
  patientId: string;
  patientAdditionalInfo: {
    id: string;
    name: string;
    value: string;
    type: string;
  }[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm();

  const utils = api.useUtils();

  const updateAdditionalInfoMutation =
    api.patient.updateAdditionalInfo.useMutation({
      onSuccess: () => {
        setIsEditing(false);
        utils.patient.invalidate();
      },
    });

  const onSubmit = () => {
    updateAdditionalInfoMutation.mutate({ patientId, data: form.getValues() });
  };

  if (!patientAdditionalInfo.length) {
    return null;
  }

  return (
    <EditableSection
      name="Additional information"
      isEditing={isEditing}
      form={form}
      editOnClick={() => setIsEditing(true)}
      cancelOnClick={() => {
        setIsEditing(false);
        form.reset(patientAdditionalInfo);
      }}
      onSave={onSubmit}
      saving={updateAdditionalInfoMutation.isPending}
    >
      {patientAdditionalInfo.map((item) => (
        <FormTextInput
          label={item.name}
          name={item.id}
          key={item.id}
          type={item.type}
        />
      ))}
    </EditableSection>
  );
}
