"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PATIENT_STATUSES } from "@/lib/consts";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Control, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";

const formSchema = z.object({
  firstName: z.string({
    message: "Required",
  }),
  middleName: z.string({
    message: "Required",
  }),
  lastName: z.string().nonempty({
    message: "Required",
  }),
  dob: z
    .string()
    .regex(/(0[1-9]|1[1,2])(\/|-)(0[1-9]|[12][0-9]|3[01])(\/|-)(19|20)\d{2}/, {
      message: "Must be in the form mm/dd/yyyy",
    }),
  status: z.enum(PATIENT_STATUSES),
});

type FormType = z.infer<typeof formSchema>;

type FormKeys = keyof FormType;

const PatientEditFormInput = ({
  formControl,
  name,
  label,
  placeholder,
}: {
  formControl: Control<FormType>;
  name: FormKeys;
  label: string;
  placeholder?: string;
}) => {
  return (
    <FormField
      control={formControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder ?? label} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

type PatientEditFormProps = {
  patient: z.infer<typeof formSchema> & { id: number };
};

export default function PatientEditForm({ patient }: PatientEditFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: patient,
  });

  const router = useRouter();

  const createPatient = api.patient.create.useMutation();
  const updatePatient = api.patient.update.useMutation();

  const onSubmit = () => {
    if (patient) {
      return updatePatient.mutate(
        { id: patient.id, ...form.getValues() },
        {
          onSuccess: () => {
            return router.refresh();
          },
        },
      );
    }
    return createPatient.mutate(form.getValues(), {
      onSuccess: (data) => {
        return router.push(`/patients/${data.id}`);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 p-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid w-full grid-cols-3 gap-6 ">
          <PatientEditFormInput
            formControl={form.control}
            name="firstName"
            label="First name"
            placeholder="John"
          />
          <PatientEditFormInput
            formControl={form.control}
            name="middleName"
            label="Middle name"
            placeholder="Anthony"
          />
          <PatientEditFormInput
            formControl={form.control}
            name="lastName"
            label="Last name"
            placeholder="Smith"
          />
          <PatientEditFormInput
            formControl={form.control}
            name="dob"
            label="Date of birth"
            placeholder="mm/dd/yyyy"
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the patient's status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Inquiry">Inquiry</SelectItem>
                    <SelectItem value="Onboarding">Onboarding</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="flex w-min flex-row gap-1 self-end text-sm "
          disabled={createPatient.isPending}
        >
          <Save className="w-5" /> Save
        </Button>
      </form>
    </Form>
  );
}
