"use client";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { ColumnDef, HeaderContext, SortingState } from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import dayjs from "dayjs";
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
  dob: string;
  city: string;
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
  { accessorKey: "dob", header: getHeader("Date of birth") },
  { accessorKey: "city", header: getHeader("City") },
  {
    accessorKey: "status",
    header: getHeader("Status"),
  },
  {
    id: "view",
    cell: ({ row }) => {
      return (
        <Link prefetch={false} href={`/patients/${row.original.id}`}>
          <Button variant="link">
            Go to patient chart
            <MoveRight className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];

const urlParamsSchema = z
  .object({
    sortBy: z.enum(["name", "dob", "city", "status", ""]).nullish(),
    sortDirection: z.enum(["asc", "desc", ""]).nullish(),
    status: z.enum([...PATIENT_STATUSES, "all", ""]).nullish(),
    name: z.string().nullish(),
    city: z.string().nullish(),
    dob: z.string().nullish(),
    dobOperator: z.enum(["Before", "After", "On", ""]).nullish(),
  })
  .optional();

function PTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortBy = searchParams.get("sortBy");
  2022;
  const sortDirection = searchParams.get("sortDirection");
  const status = searchParams.get("status");
  const nameParam = searchParams.get("name");
  const cityParam = searchParams.get("city");
  const dobParam = searchParams.get("dob");
  const dobOperator = searchParams.get("dobOperator");

  const [name, setName] = useState(nameParam);
  const [city, setCity] = useState(cityParam);
  const [dob, setDob] = useState(dobParam);
  const debouncedName = useDebounce(name, 300);
  const debouncedCity = useDebounce(city, 300);

  useEffect(() => {
    const search = new URLSearchParams(searchParams);
    search.set("name", debouncedName || "");
    search.set("city", debouncedCity || "");
    if (dayjs(dob).format("MM/DD/YYYY") === dob || !dob) {
      search.set("dob", dob || "");
    }
    router.push(pathname + "?" + search.toString());
  }, [debouncedName, debouncedCity, dob]);

  const { error: paramsParseError, data: parsedParams } =
    urlParamsSchema.safeParse({
      sortBy,
      sortDirection,
      status,
      city: debouncedCity,
      name: debouncedName,
      dob: dobParam,
      dobOperator,
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
    filter: {
      name: parsedParams?.name || undefined,
      status: parsedParams?.status || undefined,
      city: parsedParams?.city || undefined,
      dob: parsedParams?.dob
        ? {
            date: parsedParams?.dob,
            operator: parsedParams?.dobOperator || "On",
          }
        : undefined,
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

    const search = new URLSearchParams(searchParams);
    search.set("sortBy", state[0]?.id || "");
    search.set("sortDirection", state[0]?.desc ? "desc" : "asc");

    router.push(pathname + "?" + search.toString());
  };

  const nameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const cityOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  const dobOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDob(event.target.value);
  };

  return (
    <div className="flex  w-full grow flex-col gap-4 p-10">
      <div className="grid w-full grid-cols-3 flex-row gap-4">
        <Input
          name="name"
          placeholder="Search by name..."
          className="flex flex-grow flex-row"
          onChange={nameOnChange}
          value={name || ""}
        />
        <Input
          name="city"
          placeholder="Search by city..."
          className="flex flex-grow flex-row"
          onChange={cityOnChange}
          value={city || ""}
        />
        <Select
          onValueChange={(val) => {
            const searchParams = new URLSearchParams();
            searchParams.set("status", val);
            router.push(pathname + "?" + searchParams.toString());
          }}
          value={status || "all"}
        >
          <SelectTrigger className="min-w-64">
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
        <div className="col-span-2 flex flex-row items-center gap-2">
          <p className="whitespace-nowrap text-sm font-semibold">
            Date of birth:
          </p>
          <Select
            onValueChange={(val) => {
              const search = new URLSearchParams(searchParams);
              search.set("dobOperator", val);
              router.push(pathname + "?" + search.toString());
            }}
            value={dobOperator || ""}
          >
            <SelectTrigger className="min-w-32">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Before">Before</SelectItem>
                <SelectItem value="On">On</SelectItem>
                <SelectItem value="After">After</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Input
            name="dob"
            placeholder="MM/DD/YYYY"
            className="flex w-fit flex-row"
            onChange={dobOnChange}
            value={dob || ""}
          />
        </div>
        <Button
          onClick={() => {
            router.push(pathname);
            setDob("");
            setName("");
            setCity("");
          }}
          variant="secondary"
        >
          Clear filters
        </Button>
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
