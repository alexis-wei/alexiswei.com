"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <div className="flex max-w-[320px] grow flex-col gap-4 p-4">
        <div className="w-full items-start">
          <h1>a little lost?</h1>
        </div>
        <div className="w-full items-end text-end">
          <h1>don't worry, i got you</h1>
        </div>
        <div className="w-full items-start pt-4">
          <Button
            variant="outline"
            className="rounded-none font-serif font-bold shadow-md hover:border-stone-600 hover:bg-[#ffec99] hover:shadow-none"
            onClick={() => {
              router.push("/");
            }}
          >
            let's go home
          </Button>
        </div>
      </div>
    </div>
  );
}
