"use client";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { ColumnDef, HeaderContext, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ArrowUpWideNarrow,
  MoveRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { DataTable } from "./ui/data-table";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
      return (
        <Link href={`/patients/${row.original.id}`}>
          <Button variant="link">
            Go to patient chart
            <MoveRight className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];

const urlParamsSchema = z.object({
  sortBy: z.enum(["name", "age", "status", ""]).nullish(),
  sortDirection: z.enum(["asc", "desc", ""]).nullish(),
  status: z.enum([...PATIENT_STATUSES, "all", ""]).nullish(),
  name: z.string().nullish(),
});

function PTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBy");
  const sortDirection = searchParams.get("sortDirection");
  const status = searchParams.get("status");
  const nameParam = searchParams.get("name");

  const [name, setName] = useState(nameParam);
  const debouncedName = useDebounce(name, 300);

  useEffect(() => {
    const search = new URLSearchParams(searchParams);
    search.set("name", debouncedName || "");
    router.push(pathname + "?" + search.toString());
  }, [debouncedName]);

  const { error: paramsParseError, data: parsedParams } =
    urlParamsSchema.safeParse({
      sortBy,
      sortDirection,
      status,
      name: debouncedName,
    });

  useEffect(() => {
    if (paramsParseError) {
      console.error(paramsParseError);
      router.push(pathname);
    }
  }, [paramsParseError]);

  const patientsQuery = api.patient.list.useQuery({
    sort: {
      field: parsedParams?.sortBy || "name",
      direction: parsedParams?.sortDirection || "asc",
    },
    filter: {
      name: parsedParams?.name || undefined,
      status: parsedParams?.status || undefined,
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

    const searchParams = new URLSearchParams();
    searchParams.set("sortBy", state[0]?.id || "");
    searchParams.set("sortDirection", state[0]?.desc ? "desc" : "asc");

    if (status) {
      searchParams.set("status", status);
    }

    if (name) {
      searchParams.set("name", name);
    }

    const search = searchParams.toString();
    router.push(pathname + (search ? "?" + search : ""));
  };

  const nameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <div className="flex flex-col gap-4 p-10">
      <div className="flex w-full  flex-row gap-4">
        <Input
          name="name"
          placeholder="Search by name..."
          className="flex flex-grow flex-row"
          onChange={nameOnChange}
          value={name || ""}
        />
        <div className="flex flex-row gap-4">
          <Select
            onValueChange={(val) => {
              const searchParams = new URLSearchParams();
              searchParams.set("status", val);
              router.push(pathname + "?" + searchParams.toString());
            }}
            value={status || "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All statuses</SelectItem>
                {PATIENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
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
export default function PatientTable() {
  return (
    <Suspense>
      <PTable />
    </Suspense>
  );
}
