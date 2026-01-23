import { DISCLAIMER } from "@/lib/constants";

export function Footer({ disclaimer }: { disclaimer?: string }) {
  return (
    <footer className="mx-auto w-full max-w-[1600px] px-8 pb-10 text-xs text-muted-foreground xl:px-12 2xl:px-20">
      {disclaimer || DISCLAIMER}
    </footer>
  );
}
