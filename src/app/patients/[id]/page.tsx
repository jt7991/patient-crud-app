import PatientEditForm from "@/components/PatientEditForm";
import { api } from "@/trpc/server";

export default async function PatientProfile({
  params,
}: {
  params: { id: string };
}) {
  const patient = await api.patient.getById(params.id);

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return <PatientEditForm patient={patient} />;
}
