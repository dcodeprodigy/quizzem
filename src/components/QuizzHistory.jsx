import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Pen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import evalScoreColor from "@/utils/evaluateScoreColor.js";
import NoQuizHistory from "./NoQuizHistory.jsx";
import refreshAccess from "@/utils/refreshAccess.js";
import { ErrorToast } from "@/utils/toast.js";
import ToolTip from "@/components/AddedInfo";
import OverlayAnimation from "./OverlayAnimation.jsx";
import axios from "axios";
import Wait from "@/utils/wait.js";
const apiUrl = import.meta.env.VITE_API_URL;


const fetchQuizForRetake = async (quizId, navigate) => {
  try {
    console.log(`${apiUrl}/api/me/quiz/retake/${quizId}`)
    const response = await axios.get(`${apiUrl}/api/me/quiz/retake/${quizId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response, "quizdata")
    const quizData = response.data;
    const navLink = quizData.mode === "exam" ? `/quiz/e/${quizId}` : `/quiz/s/${quizId}`
    navigate(navLink, { state: quizData });
  } catch (error) {
    if (error?.response?.data?.refresh) {
      const x = await refreshAccess();
      if (x) {
        return await fetchQuizForRetake(quizId, navigate);
      } else {
        ErrorToast("Session expired.");
        await Wait();
        return navigate("/login");
      }
    }
    ErrorToast(error?.response?.data?.msg || error?.message || "An error occurred.")
    console.log(error);
  }
}

const MapQuizHistory = ({ showfullHist, dashboardData, overlayAnimation, isLoading, setIsLoading }) => {
  const quizHistory = dashboardData?.quizHistory;
  const setOverlay = overlayAnimation
  const navigate = useNavigate();
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);

  const Content = ({ quiz }) => {
    const date = new Date(quiz?.updatedAt);
    const formattedDate = date?.toLocaleString('en-NG', { day: 'numeric', month: 'numeric', year: 'numeric' });
    return (
      <AccordionContent className="px-5 data-[state=open]:p-5">
        <p className="flex justify-between items-center text-gray-500 text-xs font-normal py-4 data-[state=open]:p-5">
          <p>Last Modified: {formattedDate}</p>
          <button className="text-blue-600 shadow-xs hover:shadow-sm transition-all p-2 hover:bg-white/80  hover:text-blue-900 font-medium flex items-center gap-2 rounded-2xl text-xs cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            
          }}
          >
            <Pen size={13} />
            <span>Rename</span>
          </button>
        </p>
        <Separator className="mb-2" />
        <div className="flex flex-col sm:grid sm:grid-cols-[4fr_0.3fr_1.2fr] lg:grid-cols-[4fr_0.5fr_1.5fr] place-items-center">
          <Button className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 cursor-pointer text-xs"
            disabled={isLoadingPrev}
            value={quiz.quizId}
            onClick={async (e) => {
              setIsLoadingPrev(prev => prev = true);
              setOverlay(true);
              console.log(e.target.value);
              await fetchQuizForRetake(e.target.value, navigate);
              setOverlay(false);
              setIsLoadingPrev(false);
            }}
          >
            <RefreshCw /> Retake Quiz
          </Button>
          <Separator orientation="vertical" />
          <div className="flex justify-end lg:justify-between w-full items-center gap-2 mt-2.5 sm:mt-0">
            <Checkbox id="failed-only" className="cursor-pointer" disabled />
            <label
              htmlFor="failed-only"
              name="failed-only"
              disabled
              aria-disabled
              className="flex justif items-center text-gray-500 text-xs font-normal py-1 cursor-pointer whitespace-nowrap"
            >
              <span className="mr-2">Failed Only</span>
              <ToolTip
                text={`This feature is currently unavailabe`}
              />
            </label>
          </div>
        </div>
      </AccordionContent>
    );
  };

  const Trigger = ({ quiz }) => {
    return (
      <AccordionTrigger
        className="data-[state=open]:bg-blue-50/15 data-[state=open]:text-blue-900 data-[state=open]:rounded-none px-5 py-4 data-[state=open]:px-5 data-[state=open]:border-b-[1px] grid grid-cols-[9fr_0.5fr] items-center"
        title={quiz.title}
      >
        <div className="flex justify-between min-w-0">
          <span className="!truncate">{quiz.title}</span>
          <span
            className={`${evalScoreColor(
              quiz?.score ?? "--"
            )} py-1 px-3 rounded-md text-xs`}
          >
            {quiz?.score ?? "--"}%
          </span>
        </div>
      </AccordionTrigger>
    );
  };

  if (!showfullHist) {
    // {console.log(quizHistory)}
    const lastFiveHistoryComponents = quizHistory
      .slice(-5)
      .reverse() // Reverse their order (most recent first)
      .map((quiz) => (
        <AccordionItem value={quiz.quizId} key={quiz.quizId} className="w-full">
          <Trigger quiz={quiz} />
          <Content quiz={quiz} />
        </AccordionItem>
      ));

    return (
      <>
        {lastFiveHistoryComponents.length > 0 ? (
          <Accordion type="single" collapsible>
            {lastFiveHistoryComponents}
          </Accordion>
        ) : (
          <NoQuizHistory />
        )}
      </>
    );
  } else {
    const AllHistoryComponents = [...quizHistory].reverse().map((quiz) => {
      return (
        <AccordionItem value={quiz.quizId} key={quiz.quizId} className="w-full">
          <Trigger quiz={quiz} />
          <Content quiz={quiz} />
        </AccordionItem>
      );
    });

    return (
      <>
        {AllHistoryComponents.length > 0 ? (
          <>
            <ScrollArea className="h-[350px]">
              <Accordion type="single" collapsible>
                {AllHistoryComponents}
              </Accordion>
            </ScrollArea>
          </>
        ) : (
          <NoQuizHistory />
        )}
      </>
    );
  }
};

export default MapQuizHistory