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
import OverlayAnimation from "./OverlayAnimation.jsx";
import axios from "axios";
import Wait from "@/utils/wait.js";


const fetchQuizForRetake = async (quizId, navigate) => {
  try {
     const apiUrl = import.meta.VITE_API_URL
    const response = await axios.get(`${apiUrl}/api/me/quiz/retake/${quizId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log(response, "quizdata")
    const quizData = response.data
    navigate(`${quizData.mode === "exam" ? `/quiz/e/${quizData.quizId}` : `/quiz/s/${quizData.quizId}`}`, {state: quizData});
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
    const [isLoadingPrev, setIsLoadingPrev] = useState(false)
    console.log(setOverlay);

    const Content = ({ quiz }) => {
      return (
        <AccordionContent className="px-5 data-[state=open]:p-5">
          <p className="text-gray-500 text-xs font-normal py-4 data-[state=open]:p-5">
            Taken on: {quiz.modifiedAt}
          </p>
          <Separator className="mb-2" />
          <div className="flex flex-col sm:grid sm:grid-cols-[4fr_0.3fr_1.2fr] lg:grid-cols-[4fr_0.5fr_1.5fr] place-items-center">
            <Button className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 cursor-pointer text-xs"
            disabled={isLoadingPrev}
            value={quiz.quizId}
            onClick={async (e) => {
              setIsLoadingPrev(true);
              setOverlay(true);
              await fetchQuizForRetake(e.target.value, navigate);
              setOverlay(false);
              setIsLoadingPrev(false);
            }}
            >
              <RefreshCw /> Retake Quiz
            </Button>
            <Separator orientation="vertical" />
            <div className="flex justify-end lg:justify-between w-full items-center gap-2 mt-2.5 sm:mt-0">
              <Checkbox id="failed-only" className="cursor-pointer" />
              <label
                htmlFor="failed-only"
                name="failed-only"
                className="text-gray-500 text-xs font-normal py-1 cursor-pointer whitespace-nowrap"
              >
                Failed Only
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
      {console.log(quizHistory)}
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
          <AccordionItem value={quiz.id} key={quiz.id} className="w-full">
            <Trigger quiz={quiz} />
            <Content quiz={quiz} />
          </AccordionItem>
        );
      });

      return (
        <>
          {AllHistoryComponents.length > 0 ? (
            <>
              <ScrollArea className="h-[250px]">
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