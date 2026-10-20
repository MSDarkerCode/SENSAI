
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";

const OnboardingPage = () => {
  return (
    <Suspense
      fallback={
        <div className="mt-4">
          <BarLoader
            className="mt-4"
            width="100%"
            color="gray"
          />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
};

async function OnboardingContent() {
  // Check if the user is already onboarded
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
}

export default OnboardingPage;