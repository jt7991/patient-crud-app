import { Plus } from "lucide-react";
import { useState } from "react";
import AddressForm, { Address } from "./AddressForm";
import { Button } from "./ui/button";

export default function AddressSection({
  patientId,
  addresses,
}: {
  patientId: string;
  addresses: Address[];
}) {
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);
  return (
    <div className="flex  w-full flex-col gap-6 px-10 pb-20 pt-10 ">
      <div className="flex flex-row justify-between border-b-2 border-b-primary">
        <h2 className="text-xl font-bold">Addresses</h2>
      </div>
      {addresses.map((address) => (
        <AddressForm
          key={address.id}
          address={address}
          patientId={patientId}
          isCreating={false}
          isOnlyAddress={addresses.length === 1}
          setIsCreating={() => {}}
        />
      ))}
      {isCreatingAddress ? (
        <AddressForm
          isCreating
          setIsCreating={setIsCreatingAddress}
          patientId={patientId}
          address={null}
          isOnlyAddress={addresses.length === 0}
        />
      ) : (
        <Button
          icon={<Plus />}
          className="self-end"
          onClick={() => setIsCreatingAddress(true)}
        >
          Add Address
        </Button>
      )}
    </div>
  );
}
