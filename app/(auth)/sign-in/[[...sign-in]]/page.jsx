
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignIn />
    </Suspense>
  );
};

export default Page;