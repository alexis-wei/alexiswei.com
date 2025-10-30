import { Button } from "@/components/ui/button";

export default function SocialMedia() {
  return (
    <div className="flex h-fit items-start">
      <Button
        className="w-6"
        variant="ghost"
        size="icon"
        aria-label="calendar link to schedule initial consultation"
        onClick={() =>
          window.open("https://cal.com/itsalexiswei/30min", "_blank")
        }
      >
        <IconHeroiconsCalendar />
      </Button>
      <Button
        className="w-6"
        variant="ghost"
        size="icon"
        aria-label="link to twitter/x profile"
        onClick={() => window.open("https://www.x.com/itsalexiswei", "_blank")}
      >
        <IconBasilTwitterOutline />
      </Button>
      <Button
        className="w-6"
        variant="ghost"
        size="icon"
        aria-label="email alexis"
        onClick={() =>
          window.open("mailto:alexisw.contact@gmail.com", "_blank")
        }
      >
        <IconHeroiconsEnvelope />
      </Button>
      <Button
        className="w-6"
        variant="ghost"
        size="icon"
        aria-label="link to visit alexis' substack"
        onClick={() =>
          window.open("https://lexploress.substack.com/", "_blank")
        }
      >
        <IconBiSubstack className="scale-[80%]" />
      </Button>
      <Button
        className="w-6"
        variant="ghost"
        size="icon"
        aria-label="check out alexis' github page"
        onClick={() => window.open("https://github.com/alexis-wei", "_blank")}
      >
        <IconFeGithub />
      </Button>
    </div>
  );
}
