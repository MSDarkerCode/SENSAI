
import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";
import { Suspense } from "react";

const ResumeContent = async () => {
  const resume = await getResume();

  return <ResumeBuilder initialContent={resume?.content} />;
};

const ResumePage = () => {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div className="py-6">Loading resume...</div>}>
        <ResumeContent />
      </Suspense>
    </div>
  );
};

export default ResumePage;