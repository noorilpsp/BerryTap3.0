import { MerchantOnboardingForm } from "./components/MerchantOnboardingForm";

export default function NewMerchantPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Onboard New Merchant</h1>
        <p className="text-muted-foreground">
          Create a new merchant account and send an invitation to the owner. The owner will complete detailed setup in their dashboard.
        </p>
      </div>

      <MerchantOnboardingForm />
    </div>
  );
}
