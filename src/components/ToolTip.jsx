import React from "react";
import * as tooltip from "./ui/tooltip";
import { Info } from "lucide-react";


const ToolTip = ({ text }) => {
    return (
      <tooltip.TooltipProvider >
        <tooltip.Tooltip>
          {/* This type=button is necessary to avoid the form from submitting when this is clicked */}
          <tooltip.TooltipTrigger className="cursor-help" type="button"> 
            <Info size={14} className="hover:text-blue-700" />
          </tooltip.TooltipTrigger>
          <tooltip.TooltipContent className="text-sm max-w-[200px] text-center">
            <p>{text}</p>
          </tooltip.TooltipContent>
        </tooltip.Tooltip>
      </tooltip.TooltipProvider>
    );
  };


  export default ToolTip