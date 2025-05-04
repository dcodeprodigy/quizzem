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
import NoSavedQuiz from "./NoSavedQuiz";

const MapSavedQuizzes = ({ showFullSav, dashboardData }) => {
    const savedQuizzes = dashboardData?.savedQuizzes;
    const totalQuizzes = savedQuizzes.length;

    const Trigger = ({ quiz }) => {
      return (
        <AccordionTrigger
          className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-900 data-[state=open]:rounded-none px-5 py-4 data-[state=open]:px-5 data-[state=open]:border-b-[1px] whitespace-nowrap overflow-ellipsis"
          title={quiz.title}
        >
          {quiz.title}
        </AccordionTrigger>
      );
    };

    const Content = ({ quiz }) => {
      return (
        <AccordionContent className="px-5">
          <div className="text-gray-500 text-xs font-normal py-2 flex justify-between items-center">
            <span>Last Saved: {quiz.modifiedAt}</span>

            <button className="text-blue-500 p-2 hover:bg-blue-50  hover:text-gray-900 font-medium flex items-center gap-2 rounded-xl text-xs cursor-pointer">
              <Pen size={14} />
              <span>Rename</span>
            </button>
          </div>

          {quiz.recentScores.length > 0 && (
            <>
              <Label className="text-xs">Recent Scores:</Label>
              <div className="flex gap-2 my-2">
                {quiz.recentScores.map((score) => {
                  return (
                    <span
                      key={score}
                      className={`${evalScoreColor(
                        score
                      )} px-2 py-1 text-xs rounded-2xl font-medium border-green-200 border-[1px]`}
                    >
                      {score}%
                    </span>
                  );
                })}
              </div>
            </>
          )}

          <Separator className="mb-2" />
          <div className="flex flex-col sm:grid sm:grid-cols-[4fr_0.3fr_1.2fr] lg:grid-cols-[4fr_0.5fr_1.5fr]  place-items-center">
            <Button className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 cursor-pointer text-xs">
              <RefreshCw /> Retake Quiz
            </Button>
            <Separator orientation="vertical" />
            <div className="flex gap-2 justify-end sm:justify-between w-full items-center mt-2.5 sm:mt-0">
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

    if (!showFullSav) {
      // --- Show Last 5, Most Recent First ---
      const last5Saved = [];
      // Iterate backwards from the end of the array
      const startIndex = Math.max(0, totalQuizzes - 5); //

      const recentQuizzes = savedQuizzes.slice(startIndex).reverse();

      recentQuizzes.forEach((quiz) => {
        const Elems = (
          <AccordionItem value={quiz.quizId} key={quiz.quizId} className="w-full">
            <Trigger quiz={quiz} />
            <Content quiz={quiz} />
          </AccordionItem>
        );
        last5Saved.push(Elems);
      });

      return (
        <>
          {last5Saved.length > 0 ? (
            <Accordion type="single" collapsible>
              {last5Saved}
            </Accordion>
          ) : (
            <NoSavedQuiz />
          )}
        </>
      );
    } else {
      // --- Show All, Most Recent First ---
      const AllSaved = [...savedQuizzes]
        .reverse() // Reverse the copy (most recent is now at index 0)
        .map((quiz) => {
          return (
            <AccordionItem value={quiz.id} key={quiz.id} className="w-full">
              <Trigger quiz={quiz} />
              <Content quiz={quiz} />
            </AccordionItem>
          );
        });

      return (
        <>
          {AllSaved.length > 0 ? (
            <ScrollArea className="h-[250px]">
              <Accordion type="single" collapsible>
                {AllSaved}
              </Accordion>
            </ScrollArea>
          ) : (
            <NoSavedQuiz />
          )}
        </>
      );
    }
  };


  export default MapSavedQuizzes