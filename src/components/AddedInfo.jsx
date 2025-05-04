import React from "react";
import * as tooltip from "./ui/tooltip";
import { Popover } from "radix-ui";
import { Info } from "lucide-react";
import useInputDeviceType from "@/utils/useInputType";

const Trigger = () => {
  return <Info size={14} className="hover:text-blue-700" />;
};

const PopOver = ({ text }) => {
  return (<Popover.Root>
    <Popover.Trigger>
      <Trigger/>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        className="text-sm max-w-[200px] text-center bg-primary text-primary-foreground p-2 rounded-md"
        sideOffset={5}
      >
        <p>{text}</p>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>)
};

const ToolTip = ({ text }) => {
  return (
    <tooltip.TooltipProvider>
      <tooltip.Tooltip>
        {/* This type=button is necessary to avoid the form from submitting when this is clicked */}
        <tooltip.TooltipTrigger
          className="cursor-help"
          type="button"
        >
          <Trigger/>
        </tooltip.TooltipTrigger>
        <tooltip.TooltipContent className="text-sm max-w-[200px] text-center">
          <p>{text}</p>
        </tooltip.TooltipContent>
      </tooltip.Tooltip>
    </tooltip.TooltipProvider>
  );
};


const Description = ({text}) => {
  const inputType = useInputDeviceType()
  
  return (
    <>
      {inputType === "touch" || inputType === "unknown" ? <PopOver text={text}/> : <ToolTip text={text}/>}
    </>
  )
}

export default Description;
