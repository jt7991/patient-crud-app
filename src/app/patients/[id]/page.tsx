import PatientEditForm from "@/components/PatientEditForm";
import { api } from "@/trpc/server";
import { CircleUserRound } from "lucide-react";

export default async function PatientProfile({
  params,
}: {
  params: { id: string };
}) {
  const patient = await api.patient.getById(params.id);

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const name = `${patient.firstName} ${patient.lastName}`;
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-4 pl-6 pt-6">
        <CircleUserRound className="h-24 w-24" />
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      <PatientEditForm patient={patient} />
    </div>
  );
}
