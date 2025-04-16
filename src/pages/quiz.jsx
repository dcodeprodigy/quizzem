import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { motion } from "framer-motion";
import LoadingDots from "@/components/loading-dots";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { CircleX } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical } from "lucide-react";

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
  const [scoreCount, setScoreCount] = useState(0);
  const quizCard = useRef(null);
  const [submitConfirm, setSubmitConfirm] = useState(false);

  const scrollIntoView = (Elem) => {
    // Scroll an element into view
    Elem.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const SubmitConfirmation = () => {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger 
            className={`md:!py-2 md:!px-8 !px-2.5 not-disabled:cursor-pointer rounded-md text-sm font-medium text-center shadow-xs ${
              currentQuestion === quizData.questions.length &&
              "!bg-red-600 disabled:!bg-red-200 !text-white"
            }`}
          >
            <span className="hidden md:inline-block ">Submit</span>
            <ChevronRight className="md:hidden" size={16}/>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end your quiz session, even if it's not finished.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => endQuiz}>End</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  const endQuiz = () => {
    // show loading animation
    // send request to save user score
    // navigate to dashboard page, with newly fetched dashboard data loaded
  };

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
      // Server shall pass only the answer for that particular question ONLY!!!. For now, check answer function may not work.
    //   const response = await axios.get(
    //     `/quiz/s/${quizId}/a/${currentQuestion - 1})`

        const response = await axios.get('/mock/answer.json'); // Get the answer
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
              disableAskAi: false,
              explanation: response.data.explanation,
              correctAnswer: response.data.correctAnswer, // TODO : replace with answer from backend
              isCorrect:
              response.data.correctAnswer == quizState[currentQuestion - 1].selectedAnswer
                  ? true
                  : false,
            };
          } else return prevQuizState;
        });
      });

      quizState.map((questionState) => {
        // Increment the scoreCount as appropriate
        questionState.isCorrect && setScoreCount(scoreCount + 1);
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

  const updateAskAiField = (newValue) => {
    setQuizState((prevQuizState) => {
      return prevQuizState.map((questionState, index) => {
        if (index === currentQuestion - 1) {
          return {
            ...questionState,
            askAiField: newValue,
          };
        } else return questionState;
      });
    });
  };

  const state = [
    {
      questionId: 0,
      selectedAnswer: "A",
      correctAnswer: null,
      checkAnswerDisabled: true, // default value which will be updated
      explanation: null,
      aiConvo: null,
      showAskAI: false, // Set to true on toggle switch
      disableAskAi: true, // Set to false when user has checked answer (https). || Set to true when user has not checked answer
      askAiField: "",
    },
    {
      questionId: 0,
      selectedAnswer: "A",
      correctAnswer: null,
      checkAnswerDisabled: true,
      explanation: null,
      aiConvo: null,
      showAskAI: false,
      disableAskAi: true,
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
          className={`py-7 flex justify-between items-center w-full font-normal border-gray-300 shadow-none  rounded-lg not-disabled:cursor-pointer transition-all duration-500 disabled:cursor-not-allowed ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            "border-blue-400  bg-blue-50 ring-2 ring-blue-500 ring-offset-1"
          }
          ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1]?.isCorrect &&
            "border-green-400 bg-blue-green ring-2 ring-green-500 ring-offset-0"
          }

          ${
            quizState[currentQuestion - 1]?.correctAnswer === option &&
            "border-green-400  bg-green-50 ring-2 ring-green-500 ring-offset-0"
          }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-1"
          }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].correctAnswer !== null &&
            quizState[currentQuestion - 1].correctAnswer !== option &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-0"
          }
          `}
          onClick={
            !quizState[currentQuestion - 1].correctAnswer &&
            isRequesting === false
              ? () => {
                  // This means only run this onClick function when we are not requesting and there is no correctAnswer in state
                  console.log(quizState);
                  // Set as selected answer in state
                  setQuizState((prevQuizState) => {
                    return prevQuizState.map((questionState, index) => {
                      if (index === currentQuestion - 1) {
                        return {
                          ...questionState,
                          selectedAnswer: option, // use  the actuall option instead. helps to easily shuffle options on initial render without issues of indexing when accessing correct answer
                          checkAnswerDisabled: false,
                        };
                      } else return questionState;
                    });
                  });
                  setDisableButtons(false);
                }
              : undefined
          }
        >
          <div className="flex gap-3 items-center">
            <span
              // In this classnames we used isCorrect === false and not !isCorrect because a var may be falsy but not false
              className={`w-7 h-7 flex items-center justify-center text-sm rounded-full border-2 border-gray-400 font-medium ${
                quizState[currentQuestion - 1]?.selectedAnswer ===
                option && "bg-blue-500 !border-blue-500 text-white"
              }
            ${
              quizState[currentQuestion - 1]?.selectedAnswer === option &&
              quizState[currentQuestion - 1]?.isCorrect &&
              "bg-green-500 !border-green-500 text-white"
            }

            ${
              quizState[currentQuestion - 1]?.correctAnswer === option &&
              "bg-green-500 !border-green-500 text-white"
            }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "bg-red-500 !border-red-500 text-white"
          } 
            `}
            >
              {optionLetter}
            </span>
            <span
              className={`sm:text-base ${
                quizState[currentQuestion - 1]?.selectedAnswer ===
                option && "font-medium"
              }
            ${
              quizState[currentQuestion - 1]?.selectedAnswer === option &&
              quizState[currentQuestion - 1]?.isCorrect &&
              "font-medium text-green-800"
            }

            ${
              quizState[currentQuestion - 1]?.correctAnswer === option &&
              "font-medium text-green-800"
            }

          ${
            quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "font-medium text-red-800"
          }
            `}
            >
              {option}
            </span>
          </div>
          <CircleCheck
            className={`hidden text-green-500
            ${
              quizState[currentQuestion - 1]?.correctAnswer === option &&
              "inline-block"
            }
            `}
          />
          <CircleX
            className={`hidden text-red-500 
            ${
              quizState[currentQuestion - 1]?.selectedAnswer === option &&
              quizState[currentQuestion - 1].correctAnswer !== null &&
              quizState[currentQuestion - 1].correctAnswer !== option &&
              "inline-block"
            }
            `}
          />
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
            disableAskAi: true,
            askAiField: "",
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
                      <div className="flex flex-col gap-1">
                        <Skeleton className="w-[50px] h-[18px]" />
                        <Skeleton className="w-[50px] h-[18px]" />
                      </div>
                      <Skeleton className="w-[40px] h-[40px] rounded-full" />
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

            <main className="container m-auto px-8">
              {isLoading ? (
                "Loading Skeleton"
              ) : (
                <>
                  <div className="grid md:grid-cols-[2fr_1fr] gap-3 md:gap-8 mt-5">
                    {/* Quiz answering section (LHS)  */}
                    <section ref={quizCard}>
                      <div className="mb-6">
                        <h1 className="text-2xl font-medium text-gray-900 my-2 md:mt-0">
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

                      {quizState[currentQuestion - 1].correctAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            className={`mt-5 flex flex-col gap-6 rounded-xl border py-6 shadow-sm border-l-4 text-sm ${
                              quizState[currentQuestion - 1].isCorrect
                                ? "bg-green-50 border-green-500"
                                : "bg-red-50 border-red-500 "
                            }`}
                          >
                            <CardContent className="p-4 md:p-5 space-y-2">
                              <CardTitle className="font-semibold text-sm md:text-base text-gray-900">
                                {quizState[currentQuestion - 1].isCorrect
                                  ? "Correct!"
                                  : "Incorrect."}{" "}
                                Explanation
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-700">
                                {quizState[currentQuestion - 1].explanation}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}

                      {/* Switch Section for Ask AI */}
                      <div className="flex items-center my-6 space-x-2">
                        <Switch
                          id="ask-ai"
                          size={16}
                          //  only when correct answer has been fetched, enable ability to ask ai
                          disabled={
                            quizState[currentQuestion - 1].correctAnswer
                              ? false
                              : true
                          }
                          checked={
                            !quizState[currentQuestion - 1].showAskAI
                              ? false
                              : true
                          } // uncheck when we move to next question and its showAskAI is false
                          className="data-[state=checked]:bg-blue-600"
                          onCheckedChange={() => {
                            setQuizState((prevQuizState) => {
                              return prevQuizState.map(
                                (questionState, index) => {
                                  if (index === currentQuestion - 1) {
                                    return {
                                      ...questionState,
                                      showAskAI: !questionState.showAskAI,
                                    };
                                  } else return questionState;
                                }
                              );
                            });
                          }}
                        />
                        <Label
                          htmlFor="ask-ai"
                          className="text-sm font-normal text-gray-700"
                        >
                          Ask AI Follow-up
                        </Label>
                      </div>
                      {/* The Input for asking AI */}
                      {/* <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center space-x-2 pt-1"
                            ></motion.div> */}
                      {/* TODO: showAskAI & disableAskAI (Add these states) */}
                      {!quizState[currentQuestion - 1].disableAskAi &&
                        quizState[currentQuestion - 1].showAskAI && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="my-5 p-4">
                              {console.log("me")}
                              <CardAction className="flex gap-3 w-full">
                                <Input
                                  placeholder="Ask AI anything about this question..."
                                  className="text-sm"
                                  onChange={(e) =>
                                    updateAskAiField(e.target.value)
                                  }
                                  value={
                                    quizState[currentQuestion - 1].askAiField
                                  }
                                />
                                <Button
                                  className="bg-blue-600"
                                  disabled={
                                    !quizState[currentQuestion - 1].askAiField
                                      ? true
                                      : false
                                  }
                                >
                                  <Send />
                                </Button>
                              </CardAction>
                            </Card>
                          </motion.div>
                        )}

                      <Separator className="hidden sm:block" />

                      {/* Mobile Switch for Questions */}
                      <div className="flex justify-between bg-white fixed bottom-0 left-0 w-full px-3 py-3 shadow-2xl md:bg-transparent md:relative md:shadow-none z-50">
                        {/* Prev Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="md:py-2 md:px-12 not-disabled:cursor-pointer"
                          disabled={
                            (currentQuestion === 1 && true) ||
                            (isRequesting && disableButtons)
                          }
                          onClick={
                            currentQuestion > 1
                              ? () => {
                                  nextQuestion(false);
                                  scrollIntoView(quizCard);
                                }
                              : undefined
                          }
                        >
                          <span className="hidden md:block">Previous</span>
                          <ChevronLeft className="md:hidden" />
                        </Button>

                        {/* Check Answer */}
                        {!quizState[currentQuestion - 1].correctAnswer ? (
                          <Button
                            className="bg-blue-600 not-disabled:cursor-pointer"
                            disabled={
                              quizState[currentQuestion - 1].correctAnswer
                                ? true
                                : quizState[currentQuestion - 1]
                                    .checkAnswerDisabled // If current correct answer exists, then leave the button disabled even after successful request to backend for answer
                            }
                            onClick={checkAnswer}
                          >
                            {isRequesting ? <LoadingDots /> : "Check Answer"}
                          </Button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div
                              className={`flex items-center space-x-2 ${
                                quizState[currentQuestion - 1].isCorrect
                                  ? "text-green-600 bg-green-50 border-green-200"
                                  : "text-red-600 bg-red-50 border-red-200"
                              } font-semibold px-3 py-2 text-sm rounded-md  border `}
                            >
                              {quizState[currentQuestion - 1].isCorrect ? (
                                <CircleCheck size={18} />
                              ) : (
                                <CircleX size={18} />
                              )}
                              <span>
                                {quizState[currentQuestion - 1].isCorrect
                                  ? "Correct!"
                                  : "Incorrect."}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {/* Next Button */}
                        {currentQuestion === quizData.questions.length ? (
                          <SubmitConfirmation
                            className={`${
                              currentQuestion === quizData.questions.length &&
                              "!bg-red-600 disabled:!bg-red-200 !text-white"
                            }`}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            className={`not-disabled:bg-blue-600 not-disabled:text-white not-disabled:cursor-pointer md:py-2 md:px-12 `}
                            disabled={isRequesting && disableButtons}
                            onClick={
                              currentQuestion < quizData.questions.length
                                ? () => {
                                    nextQuestion(true);
                                    scrollIntoView(quizCard);
                                  }
                                : undefined
                            }
                          >
                            <span className="hidden md:block">
                              {currentQuestion < quizData.questions.length &&
                                "Next"}
                            </span>
                            <ChevronRight className="md:hidden" />
                          </Button>
                        )}
                      </div>
                    </section>

                    {/* Section for displaying jumping to different quiz questions */}
                    <Card className="p-5 md:sticky md:top-0 h-[90vh]">
                      <CardHeader className="flex flex-col justify-center items-center p-4 bg-blue-50 border border-blue-200 rounded-lg text-center gap-1">
                        <CardTitle className="text-3xl font-bold text-blue-700">
                          {(
                            (scoreCount / quizData.questions.length) *
                            100
                          ).toFixed(1)}
                          %
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          You got {scoreCount} answer correct
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 overflow-y-auto relative">
                        <Label className="text-gray-500 font-semibold p-0 mb-4 sticky top-0 bg-white pb-2">
                          QUESTIONS
                        </Label>
                        <div className="flex flex-col gap-2">
                          {quizState.map((questionState, index) => {
                            return (
                              <Button
                                key={`toQuestion${index + 1}`}
                                onClick={() => {
                                  setCurrentQuestion(index + 1);
                                  scrollIntoView(quizCard);
                                }}
                                className={`flex gap-3 !py-5 w-full justify-start items-center bg-white text-gray-700 shadow-none ${
                                  currentQuestion === index + 1 &&
                                  "text-blue-700 bg-blue-100 border-1 border-blue-300"
                                }`}
                              >
                                {!questionState.correctAnswer ? (
                                  <GripVertical className="text-gray-500" />
                                ) : questionState.isCorrect ? (
                                  <CircleCheck
                                    size={14}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <CircleX className="text-red-500" />
                                )}
                                <span className="truncate">
                                  Question {index + 1}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
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
