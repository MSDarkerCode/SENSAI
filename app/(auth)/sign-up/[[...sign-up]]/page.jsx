
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignUp />
    </Suspense>
  );
};

export default Page;