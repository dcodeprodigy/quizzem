import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import AppLogo from "@/components/AppLogo.jsx";
import { UserProvider } from "../../context/user";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { shuffleArray } from "@/utils/random.js";
import { motion } from "framer-motion";
import LoadingDots from "@/components/LoadingDots.jsx";
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
import { GripVertical } from "lucide-react";
import refreshAccess from "@/utils/refreshAccess.js";
import { ErrorToast } from "@/utils/toast.js";
import LoadingSpinner from "@/components/LoadingSpinner.jsx";
import { ToastContainer } from "react-toastify";

const QuizPage = ({ isExam }) => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizState, setQuizState] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // Initially, we are not requesting any answer data from backend
  const [disableButtons, setDisableButtons] = useState(true);
  const [scoreCount, setScoreCount] = useState(0);
  const quizCard = useRef(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const { state } = useLocation();
  const [timeRemaining, setTimeRemaining] = useState(60 * 20);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Only set when these guys are not null. Prevents setting them with empty values of the state itself which resets every page reload
    if (quizData && quizState) {
      localStorage.setItem(`${quizId}-data-shuffled`, JSON.stringify(quizData));
      localStorage.setItem(`${quizId}-state`, JSON.stringify(quizState));
      localStorage.setItem("scoreCount", scoreCount);
    }
  }, [quizData, quizState]);

  const scrollIntoView = (Elem) => {
    // Scroll an element into view
    Elem.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const completeScoreSentence = () => {
    if (isExam) {
      const percentageDone = (questionsAnswered / quizState.length) * 100;
      return percentageDone.toFixed(1);
    }
  };

  const calculateQA = (data) => {
    console.log("data", data);
    // On Mount, run this function, just in case the user is trying to continue a quiz
    data.questions.map((question) => {
      question.selectedAnswer && setQuestionsAnswered(questionsAnswered + 1);
    });
  };

  const calculatePercentCorrect = () => {
    return ((scoreCount / quizData.questions.length) * 100).toFixed(1) + "%";
  };

  const SubmitConfirmation = () => {
    return (
      <>
        <AlertDialog>
          <AlertDialogTrigger
            className={`md:!py-2 md:!px-8 !px-2.5 not-disabled:cursor-pointer rounded-md text-sm font-medium text-center shadow-xs ${currentQuestion === quizData.questions.length &&
              "!bg-red-600 disabled:!bg-red-200 !text-white"
              }`}
          >
            <span className="hidden md:inline-block ">Submit</span>
            <ChevronRight className="md:hidden" size={16} />
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
              <AlertDialogAction
                onClick={async () => {
                  await endQuiz();
                }}
              >
                End
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  const endQuiz = async () => {
    // show loading animation
    // send request to save user score
    const mode = isExam ? "exam" : "study";
    try {
      const response = await axios.post(
        `${apiUrl}/api/me/quiz/submit/${mode}`,
        {
          quizId, // we just need this since we have been saving the quiz state in database
          quizState: isExam && quizState,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (isExam) {
        // Set new quizState that shall be returned from backend
        setQuizState((prevState) => {
          prevState = response.data;
        });
      } else {
        localStorage.removeItem(`${quizId}-state`);
        localStorage.removeItem(`${quizId}-data-shuffled`);
        localStorage.removeItem("scoreCount");
        navigate("/dashboard");
      }
    } catch (error) {
      if (error?.response?.data?.refresh) {
        const x = await refreshAccess();
        if (x) {
          return await endQuiz();
        } else {
          await new Promise((resolve) =>
            resolve(setTimeout(ErrorToast("Session expired.")), 2500)
          );
          navigate("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }

    // navigate to dashboard page, with newly fetched dashboard data loaded
  };

  const nextQuestion = (increment) => {
    increment
      ? setCurrentQuestion((prev) => prev + 1)
      : setCurrentQuestion((prev) => prev - 1);
  };

  const checkAnswer = async () => {
    /**
     * @remark User can only check answer in study mode
     */
    if (!isExam) {
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
        // Server shall pass only the answer for that particular question ONLY!!!. For now, check answer function may not work.
        const questionId = quizState[currentQuestion - 1].questionId;
        const selectedAnswer = quizState[currentQuestion - 1].selectedAnswer;
        const response = await axios.post(
          `${apiUrl}/api/me/quiz/s/answer/${questionId}`,
          {
            quizId,
            questionId,
            selectedAnswer,
          },
          {
            timeout: 30 * 1000,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
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
              const { explanation, correctAnswer } = response.data;
              // if current index matches that of current question, mutate the explanation and correctAnswer to reflect the fetched data. Then compare both answer selected and correct one
              return {
                ...prevQuizState,
                disableAskAi: false,
                explanation: explanation,
                correctAnswer: correctAnswer,
                isCorrect:
                  correctAnswer ===
                    quizState[currentQuestion - 1].selectedAnswer
                    ? true
                    : false,
              };
            } else return prevQuizState;
          });
        });

        response.data.correctAnswer ===
          quizState[currentQuestion - 1].selectedAnswer &&
          setScoreCount((prevScore) => prevScore + 1);

        // Save current state to localStorage
      } catch (error) {
        const responseObject = error.response;

        if (responseObject?.data?.refresh) {
          const success = await refreshAccess();
          if (success) {
            // if refresh was successful, retry request
            return await checkAnswer();
          } else {
            // if refresh failed, clear local storage and redirect to login
            localStorage.clear();
            return navigate("/login");
          }
        }
        console.log(error);

        ErrorToast(
          error?.response?.data?.msg ||
          error?.response?.data ||
          "A client side error occured."
        );
        // re-enable check answer button if there is an error
        mutateQuestionState(false);
        // show toast here too
      } finally {
        setDisableButtons(false);
        setIsRequesting(false);
      }
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
          className={`py-4 !max-h-none h-auto flex justify-between items-center w-full font-normal hover:bg-gray-50 border-gray-300 shadow-none rounded-lg not-disabled:cursor-pointer transition-all duration-500 disabled:cursor-not-allowed ${quizState[currentQuestion - 1].correctAnswer &&
            "pointer-events-none"
            }  
          ${isRequesting && "pointer-events-none"}
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
            "border-blue-400  bg-blue-50 ring-2 ring-blue-500 ring-offset-1 pointer-events-none"
            }
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1]?.isCorrect &&
            "border-green-400 bg-blue-green ring-2 ring-green-500 ring-offset-0"
            }
          ${quizState[currentQuestion - 1]?.correctAnswer === option &&
            "border-green-400 bg-green-50 ring-2 ring-green-500 ring-offset-0"
            }
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].isCorrect === false &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-1"
            }
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
            quizState[currentQuestion - 1].correctAnswer !== null &&
            quizState[currentQuestion - 1].correctAnswer !== option &&
            "border-red-400  bg-red-50 ring-2 ring-red-500 ring-offset-0"
            }`}
          onClick={
            !quizState[currentQuestion - 1].correctAnswer &&
              isRequesting === false
              ? () => {
                // This means only run this onClick function when we are not requesting and there is no correctAnswer in state

                // Update questions answered state before updating selectedAnswer
                !quizState[currentQuestion - 1].selectedAnswer &&
                  setQuestionsAnswered(questionsAnswered + 1);

                // Set as selected answer in state
                setQuizState((prevQuizState) => {
                  return prevQuizState.map((questionState, index) => {
                    if (index === currentQuestion - 1) {
                      return {
                        ...questionState,
                        selectedAnswer: option, // use  the actual option instead. helps to easily shuffle options on initial render without issues of indexing when accessing correct answer
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
          {/* This div shows the option letter and option */}
          <div className="flex gap-3 items-center ">
            <span
              // In this classnames we used isCorrect === false and not !isCorrect because a var may be falsy but not false
              className={`w-7 h-7 p-3 flex items-center justify-center text-sm rounded-full border-2 border-gray-400 font-medium ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                "bg-blue-500 !border-blue-500 text-white"
                }
            ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                quizState[currentQuestion - 1]?.isCorrect &&
                "bg-green-500 !border-green-500 text-white"
                }
            ${quizState[currentQuestion - 1]?.correctAnswer === option &&
                "bg-green-500 !border-green-500 text-white"
                }
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                quizState[currentQuestion - 1].isCorrect === false &&
                "bg-red-500 !border-red-500 text-white"
                } `}
            >
              {optionLetter}
            </span>
            <span
              className={`whitespace-normal break-words sm:text-base text-left ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                "font-medium"
                }
            ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                quizState[currentQuestion - 1]?.isCorrect &&
                "font-medium text-green-800"
                }
            ${quizState[currentQuestion - 1]?.correctAnswer === option &&
                "font-medium text-green-800"
                }
          ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
                quizState[currentQuestion - 1].isCorrect === false &&
                "font-medium text-red-800"
                }`}
            >
              {option}
            </span>
          </div>
          <CircleCheck
            className={`hidden text-green-500
            ${quizState[currentQuestion - 1]?.correctAnswer === option &&
              "inline-block"
              }
            `}
          />
          <CircleX
            className={`hidden text-red-500 
            ${quizState[currentQuestion - 1]?.selectedAnswer === option &&
              quizState[currentQuestion - 1].correctAnswer !== null &&
              quizState[currentQuestion - 1].correctAnswer !== option &&
              "inline-block"
              }
            `}
          />
        </Button>
      );
    });

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


  const getUser = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/me`,

        {
          timeout: 30 * 1000,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error?.response?.data?.refresh) {
        const x = await refreshAccess();
        if (x) {
          return await getUser();
        } else {
          await new Promise((resolve) =>
            resolve(setTimeout(ErrorToast("Session expired.")), 2500)
          );
          navigate("/login");
        }
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let quizData;

        // Set QuizState to Local storage data if available
        const localQuizState = JSON.parse(
          localStorage.getItem(`${quizId}-state`)
        );
        const localQuizData = JSON.parse(
          localStorage.getItem(`${quizId}-data-shuffled`)
        );
        const score = Number(localStorage.getItem("scoreCount"))
        if (localQuizState && localQuizData) {
          /**
           * @todo Prompt user that previous state was found. Do you want to restore it?
           */
          setQuizState(localQuizState);
          setQuizData(localQuizData);
          setScoreCount(score);
        }

        if (!state && !localQuizData && !localQuizState) {
          try {
            const quizReq = await axios.get(
              `${apiUrl}/api/me/quizzes/${quizId}`,
              {
                timeout: 30 * 1000,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            quizData = quizReq.data;
          } catch (error) {
            if (error?.response?.data?.refresh) {
              const x = await refreshAccess();
              if (x) {
                return await fetchData();
              } else {
                await new Promise((resolve) =>
                  resolve(setTimeout(ErrorToast("Session expired.")), 2500)
                );
                navigate("/login");
              }
            }
            throw error;
          }
        } else {
          quizData = localQuizData ? localQuizData : state;
        }

        if (!localQuizData && !localQuizState) {
          // shuffle options
          const shuffledQuestionOptions = quizData.questions.map((question) => {
            const shuffledOptions = shuffleArray(question.options); // shuffle options
            return {
              ...question,
              options: shuffledOptions,
            };
          });
          quizData.questions = shuffledQuestionOptions; // replace non-shuffled with shuffled

          // shuffle questions order
          const shuffledQuestions = shuffleArray(quizData.questions);
          quizData.questions = shuffledQuestions;
        }

        setQuizData(quizData);

        localStorage.setItem(
          `${quizId}-data-shuffled`,
          JSON.stringify(quizData)
        );

        const userData = await getUser();
        setDashboardData(userData);

        setIsLoading(false);

        if (!localQuizState) {
          // Update Questions State
          const initialQuizState = Array.from(
            { length: quizData.questions.length },
            (_, index) => ({
              questionId: quizData.questions[index].questionId, // set question Id. It shall be sent to backend on subsequent requests for answers fetch
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
        }

        if (!localQuizState) {
          localStorage.setItem(`${quizId}-state`, JSON.stringify(quizState));
        }
        // check how many questions user has answered
        isExam ? calculateQA(quizData) : undefined;
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
            <div className="w-full shadow-sm py-4 px-4 sm:px-8 bg-white">
              <header className="container m-auto grid grid-cols-2 items-center text-slate-500">
                {isLoading ? (
                  <Skeleton className="w-[150px] sm:w-[200px] h-[32px]" />
                ) : (
                  <AppLogo />
                )}
                <div className="flex justify-end items-center gap-2 sm:gap-3">
                  {isLoading ? (
                    <div className="flex gap-2 sm:gap-3 items-center justify-end">
                      <Skeleton className="w-[60px] sm:w-[80px] h-[30px]" />
                      {/* Optionally hide text skeleton on mobile */}
                      <div className="hidden sm:flex flex-col gap-1">
                        <Skeleton className="w-[50px] h-[18px]" />
                        <Skeleton className="w-[50px] h-[18px]" />
                      </div>
                      <Skeleton className="w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] rounded-full" />
                    </div>
                  ) : (
                    <nav className="flex gap-2 sm:gap-4 items-center justify-end">
                      <Button
                        variant="secondary"
                        className="text-red-500 px-2 py-1 sm:px-3 sm:py-2 cursor-pointer text-xs sm:text-sm"
                        disabled={isLoading || isRequesting}
                        onClick={async () => {
                          setIsRequesting(true);
                          await endQuiz();
                          setIsRequesting(false);
                        }}
                      >
                        {isRequesting ? (
                          <LoadingSpinner size={16} />
                        ) : (
                          <>End {isExam ? "Exam" : "Quiz"}</>
                        )}
                      </Button>
                      {/* Optionally hide email on mobile */}
                      <div className="hidden sm:flex flex-col items-end justify-center">
                        <p className="font-medium text-gray-700 text-sm">
                          {dashboardData?.user.fName}
                        </p>
                        <p className="text-[12px]">
                          {dashboardData?.user.email}
                        </p>
                      </div>
                      <Avatar className="border-2 border-blue-100 grow-0 size-10 sm:size-12">
                        {" "}
                        {/* Adjusted size */}
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="bg-blue-500 text-white text-xs sm:text-sm">
                          {" "}
                          {/* Adjusted text size */}
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

            <main className="container m-auto px-3 md:px-4">
              {isLoading ? (
                "Loading Skeleton"
              ) : (
                <>
                  <div className="grid md:grid-cols-[2fr_1fr] gap-3 md:gap-8 mt-5">
                    {/* Quiz answering section (LHS)  */}
                    <section ref={quizCard} className="">
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
                            <p className="text-gray-900">
                              Question {currentQuestion}
                            </p>
                            <p className="text-gray-700 font-medium">
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
                            className={`mt-5 flex flex-col gap-6 rounded-xl border py-6 shadow-sm border-l-4 text-sm ${quizState[currentQuestion - 1].isCorrect
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
                      {!isExam && (
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
                      )}

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
                              <CardAction className="flex gap-3 w-full">
                                <Input
                                  placeholder="Ask AI anything about this question..."
                                  className="text-sm"
                                  onChange={(e) => {
                                    updateAskAiField(e.target.value);
                                  }}
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

                      {!isExam && <Separator className="hidden sm:block" />}

                      {/* Mobile Switch for Questions */}
                      <div className="flex justify-between bg-white fixed bottom-0 left-0 w-full px-3 py-3 shadow-2xl md:bg-transparent md:relative md:shadow-none z-50 ">
                        {/* Prev Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="md:py-2 md:px-12 not-disabled:cursor-pointer hover:bg-gray-50 transition-all duration-500"
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
                        {!quizState[currentQuestion - 1].correctAnswer &&
                          !isExam ? (
                          <Button
                            className="bg-blue-600 not-disabled:cursor-pointer hover:bg-blue-600/90 transition-all duration-500 hover:text-white"
                            disabled={
                              quizState[currentQuestion - 1].correctAnswer
                                ? true
                                : quizState[currentQuestion - 1]
                                  .checkAnswerDisabled // If current correct answer exists, then leave the button disabled even after successful request to backend for answer
                            }
                            onClick={checkAnswer}
                          >
                            {isRequesting ? (
                              <LoadingDots className="px-4" />
                            ) : (
                              "Check Answer"
                            )}
                          </Button>
                        ) : (
                          <>
                            {/* Only show this if correctAnswer becomes available. It is necessary to do it this way because of the exam mode displaying correct answers in the end */}
                            {quizState[currentQuestion - 1].correctAnswer && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div
                                  className={`flex items-center space-x-2 ${quizState[currentQuestion - 1].isCorrect
                                    ? "text-green-600 bg-green-50 border-green-200"
                                    : "text-red-600 bg-red-50 border-red-200"
                                    } font-semibold px-3 py-2 text-sm rounded-md  border md:hidden`}
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
                          </>
                        )}

                        {/* Next Button */}
                        {currentQuestion === quizData.questions.length ? (
                          <SubmitConfirmation
                            className={`${currentQuestion === quizData.questions.length &&
                              "!bg-red-600 disabled:!bg-red-200 !text-white"
                              }`}
                          />
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            className={`not-disabled:bg-blue-600 not-disabled:text-white not-disabled:cursor-pointer md:py-2 md:px-12 hover:bg-blue-600/90 transition-all duration-500 hover:text-white`}
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
                          {/* This should display the number of questions answered when in exam mode */}
                          {isExam
                            ? `${questionsAnswered}/${quizState.length}`
                            : calculatePercentCorrect()}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {isExam
                            ? `You are ${completeScoreSentence()}% complete`
                            : `You got ${scoreCount} answer${scoreCount > 1 ? "s" : ""
                            } correct`}
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
                                disabled={isRequesting && disableButtons}
                                onClick={() => {
                                  setCurrentQuestion(index + 1);
                                  scrollIntoView(quizCard);
                                }}
                                className={`flex gap-3 !py-5 w-full justify-start items-center bg-white text-gray-700 shadow-none hover:bg-gray-50 transition-all duration-500 ${currentQuestion === index + 1 &&
                                  "text-blue-700 bg-blue-100 border-1 border-blue-300 pointer-events-none"
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
              <ToastContainer />
            </main>
          </div>
        </>
      )}
    </>
  );
};
export default QuizPage;
