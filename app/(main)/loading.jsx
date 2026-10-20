import { BarLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className="mt-4">
      <BarLoader className="mt-4" width={"100%"} color="gray" />
    </div>
  );
}