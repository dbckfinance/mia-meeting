import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { About } from "./About";

interface LogoProps {
    isCollapsed: boolean;
}

const HexMark = ({ size }: { size: number }) => (
  <img
    src="/reikn-hex.png"
    alt="Reikn"
    width={size}
    height={size}
    className="block rounded-[4px]"
    draggable={false}
    style={{ imageRendering: "auto" }}
  />
);

const Logo = React.forwardRef<HTMLButtonElement, LogoProps>(({ isCollapsed }, ref) => {
  return (
    <Dialog aria-describedby={undefined}>
      {isCollapsed ? (
        <DialogTrigger asChild>
          <button ref={ref} className="flex items-center justify-start mb-2 cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity">
            <HexMark size={40} />
          </button>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <button ref={ref} className="flex items-center gap-2 mb-2 cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity">
            <HexMark size={28} />
            <span className="text-lg font-semibold tracking-tight text-gray-900">Reikn</span>
          </button>
        </DialogTrigger>
      )}
      <DialogContent>
        <VisuallyHidden>
          <DialogTitle>About Reikn</DialogTitle>
        </VisuallyHidden>
        <About />
      </DialogContent>
    </Dialog>
  );
});

Logo.displayName = "Logo";

export default Logo;
