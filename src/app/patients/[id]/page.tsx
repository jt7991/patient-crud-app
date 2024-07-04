"use client";
import PatientEditAdditionalFields from "@/components/PatientEditAdditionalFields";
import PatientEditForm from "@/components/PatientEditForm";
import { api } from "@/trpc/react";
import { CircleUserRound, LoaderPinwheel } from "lucide-react";

export default function PatientProfile({ params }: { params: { id: string } }) {
  const patientQuery = api.patient.getById.useQuery(params.id);

  if (patientQuery.isLoading) {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex items-center justify-center gap-2 pt-32">
          <LoaderPinwheel className="h-12 w-12 animate-spin" />
          <h2 className="">Loading...</h2>
        </div>
      </div>
    );
  }
  if (!patientQuery.data) {
    return <div>Patient not found</div>;
  }

  const name = `${patientQuery.data.firstName} ${patientQuery.data.lastName}`;
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-row items-center gap-4 pl-6 pt-6">
        <CircleUserRound className="h-24 w-24" />
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      <PatientEditForm patient={patientQuery.data} />
      <PatientEditAdditionalFields
        patientId={params.id}
        patientAdditionalInfo={patientQuery.data.additionalInfo}
      />
    </div>
  );
}
