import PatientTable from "@/components/PatientTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Patients() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="m-10 mb-0 flex flex-row justify-between">
        <h1 className="text-2xl font-bold"> Patients </h1>
        <a href="/patients/new" className="w-min self-end text-sm">
          <Button icon=<Plus className="h-5 w-5" />>Add patient</Button>
        </a>
      </div>
      <PatientTable />
    </main>
  );
}
