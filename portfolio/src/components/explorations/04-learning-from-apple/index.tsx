"use client";

const Main = () => {
  return (
    <div className="flex min-h-dvh w-dvw flex-col items-center justify-start gap-8 p-5 pb-32">
      <div className="flex h-fit w-full flex-col items-start gap-1 text-black">
        <h2 className="leading-none tracking-tighter">
          04-learning from apple
        </h2>
        <p className="font-serif text-xs font-bold text-stone-600">01/06/25</p>
        <p className="max-w-[400px] text-sm tracking-tighter">
          Apple is the golden standard that many of us designers and engineers
          get inspiration from—it&apos;s where we go to find best practices and
          new design patterns. From admiring them for so many years, I thought
          it would be a good idea to actually do a deep dive of their page, pay
          attention to the nitty gritty details that makes their website stand
          out the way that it is, share my learnings and anything I find through
          this experiment.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <a href="/explorations/04-learning-from-apple/clone">
          &gt; visit apple iPhone 16 page clone &lt;
        </a>
        <p className="max-w-[800px] text-sm tracking-tighter">
          Learning how to do all the scroll detection animations with GSAP
          ScrollTrigger. It&apos;s kind of weird actually trying to use this
          instead of the built in eventListeners that I&apos;m so used to using
          but this makes scroll animations so much easier and smoother with much
          less code
        </p>
        <p className="max-w-[800px] text-sm tracking-tighter">
          Something that I didn&apos;t expect to learn from here is better use
          of css variables. it&apos;s really interesting to see how Apple does
          their sizing calculations in relation to screen. They use a vw
          relative and has a min and max value for media sizing.
        </p>
      </div>
    </div>
  );
};

export default Main;
