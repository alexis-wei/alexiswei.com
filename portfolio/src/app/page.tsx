import Main from "@/components/home/Main";
import Welcome from "@/components/home/Welcome";

export default function Home() {
  return (
    <div className="flex h-dvh w-dvw items-center justify-center">
      <Main />
      <Welcome />
    </div>
  );
}
