"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <div className="flex max-w-[280px] grow flex-col gap-4 p-4">
        <div className="w-full items-start">
          <h6>a little lost?</h6>
        </div>
        <div className="w-full items-end text-end">
          <h6>don&apos;t worry, i got you</h6>
        </div>
        <div className="w-full items-start pt-4">
          <Button
            variant="outline"
            className="font-serif font-bold hover:bg-[#ffec99]"
            onClick={() => {
              router.push("/");
            }}
          >
            let&apos;s go home
          </Button>
        </div>
      </div>
    </div>
  );
}
