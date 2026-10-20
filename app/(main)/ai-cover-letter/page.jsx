
import { Suspense } from "react";
import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

async function CoverLettersContent() {
  const coverLetters = await getCoverLetters();

  return <CoverLetterList coverLetters={coverLetters} />;
}

export default function CoverLetterPage() {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          My Cover Letters
        </h1>

        <Link href="/ai-cover-letter/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="py-6 text-muted-foreground">
            Loading cover letters...
          </div>
        }
      >
        <CoverLettersContent />
      </Suspense>
    </div>
  );
}