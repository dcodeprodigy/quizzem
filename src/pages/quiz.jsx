import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import AppLogo from "@/components/applogo";
import { UserProvider } from "../../context/user";
import { useParams } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

const QuizPage = ({ isExam }) => {
  const { id: quizId } = useParams();
  const [isExamType, setIsExamType] = useState(isExam); // set the mode of the quiz
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [quizData, setQuizData] = useState({});
  const [dashboardData, setDashboardData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizState, setQuizState] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // Initially, we are not requesting any answer data from backend
  const [disableButtons, setDisableButtons] = useState(true);

  const nextQuestion = (increment) => {
    console.log(currentQuestion);
    increment
      ? setCurrentQuestion((prev) => prev + 1)
      : setCurrentQuestion((prev) => prev - 1);
  };

  const checkAnswer = async () => {
    setDisableButtons(true);
    setIsRequesting(true);
    // Disable check answer button
    const mutateQuestionState = (disable) => {
      setQuizState((prevQuizState) => {
        return prevQuizState.map((questionItem, index) => {
          if (index === currentQuestion - 1) {
            return {
              ...questionItem,
              checkAnswerDisabled: disable,
            };
          } else return questionItem;
        });
      });
    };

    mutateQuestionState(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await axios.get(
        `/quiz/s/${quizId}/a/${currentQuestion - 1}`
      ); // Get the answer
      if (!response.status == 200) {
        return mutateQuestionState(false);
      } // Show toast error message (when connecting backend)

      // Set correct answer to quizState
      setQuizState((prevQuizStates) => {
        //prevQuizStates is the array of quizState
        return prevQuizStates.map((prevQuizState, index) => {
          // prevQuizState is the OBJECT at that index
          if (index === currentQuestion - 1) {
            // if current index matches that of current question, mutate the explanation and correctAnswer to reflect the fetched data. Then compare both answer selected and correct one
            return {
              ...prevQuizState,
              explanation: "This is simulated",
              correctAnswer: "A", // TODO : replace with answer from backend
              isCorrect:
                "A" == quizState[currentQuestion - 1].selectedAnswer
                  ? true
                  : false,
            };
          } else return prevQuizState;
        });
      });
    } catch (error) {
      console.log(error);
      // re-enable check answer button if there is an error
      mutateQuestionState(false);
      // show toast here too
    } finally {
      setDisableButtons(false);
      setIsRequesting(false);
    }
  };

  const state = [
    {
      questionId: 0,
      selectedAnswer: "A",
      correctAnswer: null,
      checkAnswerDisabled: true, // default value which will be updated
      explanation: null,
      aiConvo: null,
    },
    {
      questionId: 0,
      selectedAnswer: "A",
      correctAnswer: null,
      checkAnswerDisabled: true,
      explanation: null,
      aiConvo: null,
    },
  ];

  const MapOptions = () => {
    const options = quizData["questions"][currentQuestion - 1]["options"];
    const optionsAsLetters = ["A", "B", "C", "D", "E"];
    let optionIndex = 0;

    const evaluateOptionLetter = (increment) => {
      const a = optionsAsLetters[optionIndex];
      increment && optionIndex++;
      return a;
    };

    const MappedOptions = options.map((option) => {
      const optionLetter = evaluateOptionLetter(true); // increment optionIndex

      return (
        <Button
          key={optionLetter}
          variant="outline"
          className={`py-7 w-full font-normal border-gray-300 shadow-none flex justify-start rounded-lg not-disabled:cursor-pointer transition-all duration-500 ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
            "border-blue-400  bg-blue-50 ring-2 ring-blue-500 ring-offset-1 "
          }
          ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
            quizState[currentQuestion - 1]?.isCorrect &&
            "border-green-400  bg-blue-green ring-2 ring-green-500 ring-offset-0"
          }

          ${
            quizState[currentQuestion - 1]?.correctAnswer === optionLetter &&
            "border-green-400  bg-green-50 ring-2 ring-green-500 ring-offset-0"
          }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-1"
          }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter && quizState[currentQuestion - 1].correctAnswer !== null && 
            quizState[currentQuestion - 1].correctAnswer !== optionLetter &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-0"
          }
          `}
          onClick={() => {
            console.log(quizState);
            // Set as selected answer in state
            setQuizState((prevQuizState) => {
              return prevQuizState.map((questionItem, index) => {
                if (index === currentQuestion - 1) {
                  return {
                    ...questionItem,
                    selectedAnswer: optionLetter,
                    checkAnswerDisabled: false,
                  };
                } else return questionItem;
              });
            });
            setDisableButtons(false);
          }}
        >

          <span
            className={`w-7 h-7 flex items-center justify-center text-sm rounded-full border-2 border-gray-400 font-medium ${
              quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
              "bg-blue-500 !border-blue-500 text-white"
            }
            ${
              quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
              quizState[currentQuestion - 1]?.isCorrect &&
              "bg-green-500 !border-green-500 text-white"  
            }

            ${
                quizState[currentQuestion - 1]?.correctAnswer === optionLetter &&
                "bg-green-500 !border-green-500 text-white"
              }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "bg-red-500 !border-red-500 text-white"
          }
            `}
          >
            {optionLetter}
          </span>
          <span
            className={`sm:text-base ${
              quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
              "font-medium"
            }
            ${
              quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
              quizState[currentQuestion - 1]?.isCorrect &&
              "font-medium text-green-800"
            }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === optionLetter &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "font-medium text-red-800"
          }
            `}
          >
            {option}
          </span>
          
        </Button>
      );
    });

    console.log(quizState);
    return MappedOptions;
  };

  const LoadingError = () => {
    return (
      <>
        <Card className="flex justify-center items-center w-full min-h-dvh shadow-none rounded-none border-none gap-4">
          <CardHeader className="flex justify-center items-center">
            <CardTitle className=" whitespace-nowrap text-gray-900">
              Oops!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm flex flex-col gap-3 justify-center items-center max-w-96">
            <CardDescription className="text-gray-700 text-center">
              There was an error loading your quiz. Please make sure you are
              connected to the internet.
            </CardDescription>
            <Button
              variant="secondary"
              className="cursor-pointer text-gray-700 mt-1"
              onClick={() => setLoadingError(false)}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use id from param to fetch quiz from database, while initially displaying loading spinner
        const quizReq = await axios.get("/mock/quiz.json"); // TODO: Replace this with the quizId to backend
        if (quizReq.status !== 200) return setLoadingError(true); // so that user can retry
        const quizData = quizReq.data;
        console.log(quizData);
        setQuizData(quizData);

        const userReq = await axios.get("/mock/dashboard.json");
        // console.log(userReq);
        if (userReq.status !== 200) return setLoadingError(true);
        const userData = userReq.data;
        setDashboardData(userData);

        setIsLoading(false);

        // Update Questions State
        const initialQuizState = Array.from(
          { length: quizData.questions.length },
          (_, index) => ({
            questionId: index + 1,
            selectedAnswer: null,
            correctAnswer: null,
            checkAnswerDisabled: true,
            explanation: null,
            aiConvo: null,
          })
        );
        setQuizState(initialQuizState);
      } catch (error) {
        console.error(error);
        setLoadingError(true);
      }
    };

    fetchData();
  }, [loadingError]);

  return (
    <>
      {loadingError ? (
        <LoadingError />
      ) : (
        <>
          <div className="min-h-screen pb-24 bg-gray-50">
            <div className="w-full shadow-sm py-4 px-8 bg-white">
              <header className="container m-auto grid grid-cols-2 items-center text-slate-500">
                {isLoading ? (
                  <Skeleton className="w-[200px] h-[32px]" />
                ) : (
                  <AppLogo />
                )}
                <div className="flex justify-end items-center flex-end gap-3">
                  {isLoading ? (
                    <div className="flex gap-3 items-center justify-center">
                      <Skeleton className="w-[80px] h-[30px]" />
                      <Skeleton className="w-[40px] h-[40px] rounded-full" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="w-[50px] h-[18px]" />
                        <Skeleton className="w-[50px] h-[18px]" />
                      </div>
                    </div>
                  ) : (
                    <nav className="flex gap-4 items-center justify-center">
                      <Button
                        variant="secondary"
                        className="text-red-500 p-3 cursor-pointer text-sm"
                      >
                        End Quiz
                      </Button>
                      <div className="flex flex-col items-center justify-center">
                        <p className="font-medium text-gray-700">
                          {dashboardData?.user.fName}
                        </p>
                        <p className="text-[12px]">
                          {dashboardData?.user.email}
                        </p>
                      </div>
                      <Avatar className="border-2 border-blue-100 grow-0 size-10">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {dashboardData?.user.fName
                            ? `${dashboardData?.user.fName.slice(0, 1)}`
                            : "CN"}
                        </AvatarFallback>
                      </Avatar>
                    </nav>
                  )}
                </div>
              </header>
            </div>

            <main className="container m-auto px-4 ">
              {isLoading ? (
                "Loading Skeleton"
              ) : (
                <>
                  <div className="grid md:grid-cols-[2fr_1fr] mt-5">
                    {/* Quiz answering section (LHS)  */}
                    <section>
                      <div className="mb-6">
                        <h1 className="text-2xl font-medium text-gray-900 my-2">
                          {quizData.title || "Untitled Quiz"}
                        </h1>
                        <Progress
                          value={(currentQuestion / quizState.length) * 100} // Calculate the percentage
                          className="bg-blue-100"
                        />
                      </div>
                      <Card className="rounded-2xl py-8">
                        <CardHeader>
                          <CardTitle className="flex flex-col gap-1 text-base sm:text-lg ">
                            <p className="text-gray-800">
                              Question {currentQuestion}
                            </p>
                            <p className="text-gray-700">
                              {
                                quizData["questions"][currentQuestion - 1][
                                  "question"
                                ]
                              }
                            </p>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-gray-800 font-normal space-y-3">
                          {<MapOptions />}
                        </CardContent>
                      </Card>

                      <div className="flex items-center my-6 space-x-2">
                        <Switch
                          id="ask-ai"
                          size={16}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <Label
                          htmlFor="ask-ai"
                          className="text-sm font-normal text-gray-700"
                        >
                          Ask AI Follow-up
                        </Label>
                      </div>

                      <Card className="my-5 p-4">
                        <CardAction className="flex gap-3 w-full">
                          <Input placeholder="Ask AI anything about this question..." />
                          <Button className="bg-blue-600">
                            <Send />
                          </Button>
                        </CardAction>
                      </Card>

                      <Separator className="hidden sm:block" />
                      <div className="flex justify-between bg-white fixed bottom-0 left-0 w-full px-3 py-3 shadow-2xl">
                        {/* Prev Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="not-disabled:bg-blue-600 not-disabled:text-white"
                          disabled={
                            (currentQuestion === 1 && true) ||
                            (isRequesting && disableButtons)
                          }
                          onClick={
                            currentQuestion > 1
                              ? () => {
                                  nextQuestion(false);
                                }
                              : undefined
                          }
                        >
                          <ChevronLeft />
                        </Button>

                        {/* Check Answer */}
                        <Button
                          className="bg-blue-600"
                          disabled={
                            quizState[currentQuestion - 1].correctAnswer
                              ? true
                              : quizState[currentQuestion - 1]
                                  .checkAnswerDisabled // If current correct answer exists, then leave the button disabled even after successful request to backend for answer
                          }
                          onClick={checkAnswer}
                        >
                          Check Answer
                        </Button>

                        {/* Next Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="not-disabled:bg-blue-600 not-disabled:text-white"
                          disabled={
                            (currentQuestion === quizData.questions.length &&
                              true) ||
                            (isRequesting && disableButtons)
                          }
                          onClick={
                            currentQuestion < quizData.questions.length
                              ? () => {
                                  nextQuestion(true);
                                }
                              : undefined
                          }
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    </section>
                  </div>
                </>
              )}
            </main>
          </div>
        </>
      )}
    </>
  );
};
export default QuizPage;
