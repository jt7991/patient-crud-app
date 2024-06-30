import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function Patients() {
  return (
    <main className="flex min-h-screen flex-col">
      <a href="/patients/new" className="m-10 w-min self-end text-sm">
        <Button className="flex flex-row gap-1">
          <Plus /> Add patient
        </Button>
      </a>
      <Table></Table>
    </main>
  );
}
