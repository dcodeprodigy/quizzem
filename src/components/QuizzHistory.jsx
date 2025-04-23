import React from "react";
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
import evalScoreColor from "@/utils/evaluateScoreColor";
import NoQuizHistory from "./NoQuizHistory";


const MapQuizHistory = ({ showfullHist, dashboardData }) => {
    const quizHistory = dashboardData?.quizHistory;

    const Content = ({ quiz }) => {
      return (
        <AccordionContent className="px-5 data-[state=open]:p-5">
          <p className="text-gray-500 text-xs font-normal py-4 data-[state=open]:p-5">
            Taken on: {quiz.modifiedAt}
          </p>
          <Separator className="mb-2" />
          <div className="flex flex-col sm:grid sm:grid-cols-[4fr_0.3fr_1.2fr] lg:grid-cols-[4fr_0.5fr_1.5fr] place-items-center">
            <Button className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 cursor-pointer text-xs">
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
          className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-900 data-[state=open]:rounded-none px-5 py-4 data-[state=open]:px-5 data-[state=open]:border-b-[1px] grid grid-cols-[9fr_0.5fr] items-center"
          title={quiz.title}
        >
          <div className="flex justify-between min-w-0">
            <span className="!truncate">{quiz.title}</span>
            <span
              className={`${evalScoreColor(
                quiz.score
              )} py-1 px-3 rounded-md text-xs`}
            >
              {quiz.score}%
            </span>
          </div>
        </AccordionTrigger>
      );
    };

    if (!showfullHist) {
      const lastFiveHistoryComponents = quizHistory
        .slice(-5)
        .reverse() // Reverse their order (most recent first)
        .map((quiz) => (
          <AccordionItem value={quiz.id} key={quiz.id} className="w-full">
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
            <ScrollArea className="h-[250px]">
              <Accordion type="single" collapsible>
                {AllHistoryComponents}
              </Accordion>
            </ScrollArea>
          ) : (
            <NoQuizHistory />
          )}
        </>
      );
    }
  };

  export default MapQuizHistory