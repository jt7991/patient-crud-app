import { PATIENT_STATUSES } from "@/lib/consts";
import { ColumnDef } from "@tanstack/react-table";

type PatientListItem = {
  id: number;
  firstName: string;
  lastName: string;
  status: (typeof PATIENT_STATUSES)[number];
  age: number;
};

const columns: ColumnDef<PatientListItem>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

export default function PatientTable() {}
