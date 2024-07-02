"use client";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { ColumnDef, HeaderContext, SortingState } from "@tanstack/react-table";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpWideNarrow,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { DataTable } from "./ui/data-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type PatientListItem = {
  id: string;
  name: string;
  status: (typeof PATIENT_STATUSES)[number];
  age: number;
};

const getHeader = (label: string) => {
  return (ctx: HeaderContext<PatientListItem, unknown>): JSX.Element => {
    const sortDir = ctx.column.getIsSorted();
    return (
      <Button
        variant="ghost"
        className="ml-[-1rem]"
        onClick={() =>
          ctx.column.toggleSorting(ctx.column.getIsSorted() === "asc")
        }
      >
        {label}
        {!sortDir && <ArrowUpDown className="h-4 w-4" />}
        {sortDir === "asc" && <ArrowUpWideNarrow className="h-4 w-4" />}
        {sortDir === "desc" && <ArrowDownWideNarrow className="h-4 w-4" />}
      </Button>
    );
  };
};

const columns: ColumnDef<PatientListItem>[] = [
  {
    accessorKey: "name",
    header: getHeader("Name"),
  },
  { accessorKey: "age", header: getHeader("Age") },
  {
    accessorKey: "status",
    header: getHeader("Status"),
  },
  {
    id: "view",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          variant="secondary"
          onClick={() => router.push(`/patients/${row.original.id}`)}
        >
          View
        </Button>
      );
    },
  },
];

const urlParamsSchema = z.object({
  sortBy: z.enum(["name", "age", "status"]),
  sortDirection: z.enum(["asc", "desc"]),
});

export default function PatientTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBy");
  const sortDirection = searchParams.get("sortDirection");
  const { error: paramsParseError, data: parsedParams } =
    urlParamsSchema.safeParse({
      sortBy,
      sortDirection,
    });

  useEffect(() => {
    if (paramsParseError) {
      router.push(pathname);
    }
  }, [paramsParseError]);

  const patientsQuery = api.patient.list.useQuery({
    sort: {
      field: parsedParams?.sortBy || "name",
      direction: parsedParams?.sortDirection || "asc",
    },
  });
  const updateSort = (
    stateOrFn: SortingState | ((old: SortingState) => SortingState),
  ) => {
    let state;
    if (typeof stateOrFn === "function") {
      state = stateOrFn([
        { id: sortBy || "name", desc: sortDirection === "desc" },
      ]);
    } else {
      state = stateOrFn;
    }

    router.push(
      pathname +
        `?sortBy=${state[0]?.id}&sortDirection=${state[0]?.desc ? "desc" : "asc"}`,
    );
  };

  return (
    <div className="p-10">
      <DataTable
        sortState={[
          {
            id: sortBy || "name",
            desc: sortDirection === "desc",
          },
        ]}
        setSortState={updateSort}
        columns={columns}
        data={patientsQuery.data || []}
        loading={patientsQuery.isLoading}
      />
    </div>
  );
}
