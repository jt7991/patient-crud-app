import PatientEditForm from "@/components/PatientEditForm";
import { api } from "@/trpc/server";
import { CircleUserRound, LoaderPinwheel } from "lucide-react";
import { Suspense } from "react";

async function PatientProfile({ params }: { params: { id: string } }) {
  const patient = await api.patient.getById(params.id);

  if (!patient) {
    return <div>Patient not found</div>;
  }

  const name = `${patient.firstName} ${patient.lastName}`;
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-row items-center gap-4 pl-6 pt-6">
        <CircleUserRound className="h-24 w-24" />
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      <PatientEditForm patient={patient} />
    </div>
  );
}

export default function PatientProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full flex-col items-center">
          <div className="flex items-center justify-center gap-2 pt-32">
            <LoaderPinwheel className="h-12 w-12 animate-spin" />
            <h2 className="">Loading...</h2>
          </div>
        </div>
      }
    >
      <PatientProfile params={params} />
    </Suspense>
  );
}
