interface ExplorationIntroProps {
  name: string;
  date: string;
  description: string;
}

export const ExplorationIntro = ({
  name,
  date,
  description,
}: ExplorationIntroProps) => {
  return (
    <div className="flex h-fit w-full flex-col items-start gap-1 text-black">
      <h2 className="leading-none tracking-tighter">{name}</h2>
      <p className="font-serif text-xs font-bold text-stone-600">{date}</p>
      <p className="max-w-[400px] text-sm tracking-tighter">{description}</p>
    </div>
  );
};
