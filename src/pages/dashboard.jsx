import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import AppLogo from "@/components/applogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InfoIcon, Settings, UploadCloud } from "lucide-react";
import { User } from "lucide-react";
import { CircleHelp } from "lucide-react";
import { LogOut } from "lucide-react";
import { Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CloudUpload } from "lucide-react";
import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Pen } from "lucide-react";

const WelcomeMsg = ({ dashboardData }) => {
  return (
    <>
      <div>
        <h1 className="font-bold text-3xl text-gray-800 max-[930px]:text-[clamp(1.5rem,_1rem_+_2.2vw,_2.2rem)] mt-6">
          Welcome back,{" "}
          <span className="text-blue-600">{dashboardData?.user.fName}</span>!
        </h1>
        <p className="sm:text-base">Let's get quizzing.</p>
      </div>
    </>
  );
};



const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFail, setLoadingFail] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [avScoreColor, setAvScoreColor] = useState({ score: "", progress: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(false);
  const [generateQuizData, setGenerateQuizData] = useState({});
  const [difficultyValue, setDifficultyValue] = useState("normal");
  const [modeValue, setModeValue] = useState("study");
  const [noOfQuestions, setNoOfQuestions] = useState();
  const [timeLimit, setTimeLimit] = useState(20);
  const [isTimeLimit, setIsTimeLimit] = useState(false);
  const [showFullSaved, setShowFullSaved] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [fullHistory, setFullHistory] = useState();

  const evalScoreColor = (score) => {
    if (score >= 70) {
      return "bg-green-100 text-green-700";
    } else if (score >= 50 && score < 70) {
      return "bg-yellow-100 text-yellow-700";
    } else {
      return "bg-red-100 text-red-700";
    }
  };

  const MapSavedQuizzes = ({ showFullSav }) => {
    const savedQuizzes = dashboardData?.savedQuizzes;
    const totalQuizzes = savedQuizzes.length;

    const Trigger = ({ quiz }) => {
      return (
        <AccordionTrigger className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-900 data-[state=open]:rounded-none px-5 py-4 data-[state=open]:px-5 data-[state=open]:border-b-[1px] whitespace-nowrap overflow-ellipsis" title={quiz.title}>
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
            <Separator className="my-2 sm:hidden" />
            <Separator orientation="vertical" />
            <div className="flex gap-2 justify-end sm:justify-between w-full items-center ">
              <Checkbox id="failed-only" className="cursor-pointer"/>
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
          <AccordionItem value={quiz.id} key={quiz.id} className="w-full">
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

  const MapQuizHistory = ({ showfullHist }) => {
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
            <Separator className="my-2 sm:hidden" />
            <Separator orientation="vertical" />
            <div className="flex justify-end lg:justify-between w-full items-center gap-2">
              <Checkbox id="failed-only" className="cursor-pointer"/>
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
        <AccordionTrigger className="data-[state=open]:bg-blue-50 data-[state=open]:text-blue-900 data-[state=open]:rounded-none px-5 py-4 data-[state=open]:px-5 data-[state=open]:border-b-[1px] grid grid-cols-[9fr_0.5fr] items-center" title={quiz.title}>
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
      const AllHistoryComponents = [...quizHistory] 
        .reverse()
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

  const NoSavedQuiz = () => {
    return (
      <>
        <div className=" flex flex-col text-gray-500 items-center py-10">
          <FileSearch size={50} color="oklch(70.7% 0.022 261.325)" />
          <p className="font-medium mt-2 text-sm">Nothing Found</p>
          <p className="text-gray-400 text-sm">
            You haven't saved any quizzes yet.
          </p>
        </div>
      </>
    );
  };

  const NoQuizHistory = () => {
    return (
      <>
        <div className=" flex flex-col text-gray-500 items-center py-10">
          <FileSearch size={50} color="oklch(70.7% 0.022 261.325)" />
          <p className="font-medium mt-2 text-sm">Nothing Found</p>
          <p className="text-gray-400 text-sm">
            You don't have any quiz history yet.
          </p>
        </div>
      </>
    );
  };

  // Drag and Drop Handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isGenerating) setIsDragging(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    if (isGenerating) return;
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      console.log("File dropped:", file.name);
      setUploadedFileName(file.name);
      setSelectedTopics([]);
    }
  };

  const getAvScoreColor = (pageData) => {
    if (pageData.stats.averageScore.value >= 70) {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-green-500",
        progress: "[&>div]:bg-green-500",
      }));
    } else if (pageData.stats.averageScore.value >= 50) {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-yellow-500",
        progress: "[&>div]:bg-yellow-500",
      }));
    } else {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-red-500",
        progress: "[&>div]:bg-red-500",
      }));
    }
  };

  const toggleDifficulty = () => {
    if (difficultyValue == "hard") {
      setDifficultyValue("normal");
    } else {
      setDifficultyValue("hard");
    }
  };

  const toggleMode = () => {
    if (modeValue == "study") {
      setModeValue("exam");
    } else {
      setModeValue("study");
    }
  };

  const validateTimeLimit = (e) => {
    const num = Number(e.target.value);
    if (num > 150) {
      setTimeLimit(150);
    } else if (num < 1) {
      setTimeLimit(1);
    } else {
      setTimeLimit(num);
    }
  };

  const handleSubmission = (event) => {
    event.target.preventDefault();
    alert("Sent Data for Generation");
  };

  useEffect(() => {
    const fetchData = async () => {
      // Simulate Fetch delay
      try {
        const response = await axios.get("/mock/dashboard.json");
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        console.log(response);

        if (response.status !== 200) return setLoadingFail(true); // Ask User to Reload. Will not run the next line
        console.log("am i runnign");
        setDashboardData(response.data); // If successful

        // Now that data is available, calc average score color
        getAvScoreColor(response.data);
      } catch (error) {
        console.log("An error occurred: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="w-full max-w-full bg-gradient-to-b from-gray-50 to-blue-50 ">
        <header className="w-full grid grid-cols-2 items-center text-slate-500 shadow-sm px-4 md:px-8 py-6">
          <AppLogo />

          <div className="flex justify-end items-center flex-end gap-3">
            {isLoading ? (
              "Hello"
            ) : (
              <>
                <Avatar className="border-2 border-blue-100 grow-0 size-10">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {dashboardData?.user.fName
                      ? `${dashboardData?.user.fName.slice(0, 1)}`
                      : "CN"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-medium text-gray-700">
                    {dashboardData?.user.fName}
                  </p>
                  <p className="text-[12px]">{dashboardData?.user.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="size-9 inline-flex justify-center items-center p-2 rounded-md hover:bg-gray-100 whitespace-nowrap"
                    onMouseEnter={() => setSettingsHovered(true)}
                    onMouseLeave={() => setSettingsHovered(false)}
                  >
                    <Settings
                      color={
                        settingsHovered
                          ? "oklch(62.3% 0.214 259.815)"
                          : "#6a7282"
                      }
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-1 mr-6">
                    <DropdownMenuLabel className="text-left">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-1 min-w-50">
                      <DropdownMenuItem className="flex p-2 items-center gap-4 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                        <User />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-4">
                        <Settings />
                        <span>Preferences</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-4 items-center">
                        <CircleHelp />
                        <span>Support</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 flex gap-4 items-center hover:!bg-red-100 hover:!text-red-500">
                        <LogOut />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </header>

        <main className="px-4 md:px-8 py-2">
          <WelcomeMsg dashboardData={dashboardData} />

          <section className="my-8 grid grid-cols-2 gap-3 lg:grid-cols-4 max-[300px]:grid-cols-1">
            <Card className="hover:shadow-md ">
              <CardHeader>
                <CardDescription className="flex flex-row">
                  <span className="mr-2 text-sm max-[320px]:text-xs">
                    Quizzes Taken
                  </span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info size={13} className="hover:text-blue-700" />
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <p>
                          Monthly quota of quizzes generated. <br />
                          This resets at the start of each month
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 py-1">
                  {dashboardData?.stats.quizzesTaken.value}{" "}
                  <span className="text-lg">of</span>{" "}
                  {dashboardData?.stats.quizMonthlyQuota.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={
                    (dashboardData?.stats.quizzesTaken.value /
                      dashboardData?.stats.quizMonthlyQuota.value) *
                    100
                  }
                  className="[&>div]:bg-blue-500"
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardHeader>
                <CardDescription className="flex flex-row">
                  <span className="mr-2 text-sm max-[320px]:text-xs">
                    Average Score
                  </span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info size={13} className="hover:text-blue-700" />
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <p>The average score of all quizzes taken this month</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl font-bold py-1">
                  <span className={avScoreColor.score}>
                    {dashboardData?.stats.averageScore.value}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={dashboardData?.stats.averageScore.value}
                  className={avScoreColor.progress}
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardHeader>
                <CardDescription className="flex flex-row">
                  <span className="mr-2 text-sm max-[320px]:text-xs">
                    Quizzes Created
                  </span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info size={13} className="hover:text-blue-700" />
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <p>Total number of quizzes ever created.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl font-bold text-purple-700 py-1">
                  {dashboardData?.stats.quizzesCreated.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={dashboardData?.stats.quizzesCreated.value}
                  className="[&>div]:bg-purple-500"
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md">
              <CardHeader>
                <CardDescription className="flex flex-row">
                  <span className="mr-2 text-sm max-[320px]:text-xs">
                    Saved Quizzes
                  </span>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">
                        <Info size={13} className="hover:text-blue-700" />
                      </TooltipTrigger>
                      <TooltipContent className="text-sm">
                        <p>Total number of quizzes currently in saved</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-700 py-1">
                  {dashboardData?.stats.savedQuizzes.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress
                  value={dashboardData?.stats.savedQuizzes.value}
                  className="[&>div]:bg-yellow-500"
                />
              </CardContent>
            </Card>
          </section>

          {/* Generation and Quizzes Section */}
          <section className="grid lg:grid-cols-[2fr_1fr] gap-0 sm:gap-5 lg:mt-12 lg:relative lg:items-start">
            {/* Generate Quiz */}
            <Card className="shadow-lg lg:sticky lg:bottom-0">
              <form>
                <CardHeader className="bg-gray-50 p-5">
                  <CardTitle className="font-medium text-lg">
                    Generate New Quiz
                  </CardTitle>
                  <CardDescription>
                    Upload a document and customize your quiz
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Label className="font-medium block text-sm my-3 text-gray-700">
                    Upload Document
                  </Label>

                  {/* Upload Area */}
                  <div
                    className={`relative flex items-center justify-center w-full rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200 mb-6 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 scale-105 shadow-inner"
                        : "bg-white hover:bg-gray-50"
                    } ${isGenerating ? "cursor-not-allowed bg-gray-100" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    )}
                    <label
                      htmlFor="file-dropzone"
                      className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 p-4 text-center transition-colors ${
                        isGenerating
                          ? "cursor-not-allowed text-gray-400"
                          : isDragging
                          ? "cursor-copy text-blue-600"
                          : "cursor-pointer text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <CloudUpload
                        className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 transition-transform ${
                          isDragging && !isGenerating ? "animate-bounce" : ""
                        }`}
                      />
                      {!uploadedFileName ? (
                        <>
                          <p className="mb-1 text-xs sm:text-sm">
                            <span className="font-semibold hover:text-blue-500 hover:underline">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs">
                            PDF, DOCX, TXT, PPTX (MAX. 50MB)
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-green-600 font-medium flex items-center break-all px-2">
                          <FileText
                            size={16}
                            className="inline mr-1.5 shrink-0"
                          />
                          {uploadedFileName} uploaded!
                        </p>
                      )}
                      <Input
                        id="file-dropzone"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt,.ppt,.pptx"
                        disabled={isGenerating}
                      />
                    </label>
                  </div>

                  <Separator />

                  <fieldset disabled={isGenerating} className="my-5">
                    <h3 className="font-medium text-gray-800 ">
                      Customize Quiz
                    </h3>
                    <div className="grid grid-rows-2 sm:grid-cols-2 sm:grid-rows-none sm:gap-8">
                      {/* Set Difficulty */}
                      <div className="mt-5">
                        <Label
                          className="flex items-center gap-3 mb-3"
                          htmlFor="difficulty-group"
                        >
                          <span className="text-gray-700">Difficulty</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                <Info
                                  size={14}
                                  className="hover:text-blue-700 text-gray-400"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="text-sm">
                                Normal offers standard questions. <br />
                                Select hard to attempt more complex phrasing{" "}
                                <br />
                                and trickier options.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>

                        <ToggleGroup
                          id="difficulty-group"
                          type="multiple"
                          value={difficultyValue}
                          onValueChange={toggleDifficulty}
                          size="lg"
                          className={`w-full `}
                        >
                          <ToggleGroupItem
                            className={`transition-all duration-500 ${
                              difficultyValue == "normal"
                                ? "!text-blue-600 !bg-blue-200 !border-1 !border-blue-300"
                                : "text-gray-700 bg-gray-50 border-1"
                            }`}
                            value="normal"
                            aria-label="Toggle normal"
                          >
                            Normal
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="hard"
                            aria-label="Toggle hard"
                            className={`transition-all duration-500 ${
                              difficultyValue == "hard"
                                ? "!text-red-600 !bg-red-200 !border-1 !border-red-300"
                                : "text-gray-700 bg-gray-50 border-1"
                            }`}
                          >
                            Hard
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      {/* Set Mode */}
                      <div className="mt-5">
                        <Label
                          className="flex items-center gap-3 mb-3"
                          htmlFor="mode-group"
                        >
                          <span className="text-gray-700">Mode</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-help">
                                <Info
                                  size={14}
                                  className="hover:text-blue-700 text-gray-400"
                                />
                              </TooltipTrigger>
                              <TooltipContent className="text-sm">
                                Study mode provides instant feedback. <br />
                                Exam mode show results only at the end. <br />
                                and trickier options.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>

                        <ToggleGroup
                          id="mode-group"
                          type="multiple"
                          value={modeValue}
                          onValueChange={toggleMode}
                          size="lg"
                          className={`w-full `}
                        >
                          <ToggleGroupItem
                            className={`transition-all duration-500 ${
                              modeValue == "study"
                                ? "!text-blue-600 !bg-blue-200 !border-1 !border-blue-300"
                                : "text-gray-700 bg-gray-50 border-1"
                            }`}
                            value="study"
                            aria-label="Toggle study"
                          >
                            Study
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="exam"
                            aria-label="Toggle hard"
                            className={`transition-all duration-500 ${
                              modeValue == "exam"
                                ? "!text-purple-600 !bg-purple-200 !border-1 !border-purple-300"
                                : "text-gray-700 bg-gray-50 border-1"
                            }`}
                          >
                            Exam
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>

                    <div className="flex flex-col sm:grid-cols-2 sm:grid sm:gap-8 sm:justify-between ">
                      {/* Number of Questions */}
                      <div className="mt-5">
                        <Label
                          className="flex flex-col items-start"
                          htmlFor="no-of-questions"
                        >
                          <div className="text-gray-700 flex items-center gap-3 mb-3">
                            <span>Number of Questions</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  <Info
                                    size={14}
                                    className="hover:text-blue-700 text-gray-400"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="text-sm">
                                  Select Auto to generate as many high-yield
                                  questions <br />
                                  as possible from the document. Questions are
                                  capped at 100
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Select
                            value={noOfQuestions}
                            onChange={(e) => setNoOfQuestions(e.current.value)}
                          >
                            <SelectTrigger
                              className="max-w-[135px] w-[135px] !text-gray-700"
                              id="no-of-questions"
                            >
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="text-gray-500">
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="40">40</SelectItem>
                            </SelectContent>
                          </Select>
                        </Label>
                      </div>

                      {/* Time Limit */}
                      <div className="mt-5">
                        <Label
                          className="flex text-gray-700  gap-3 mb-3 justify-between w-full"
                          htmlFor="activate-time"
                        >
                          <div className="flex gap-3 flex-shrink">
                            <span>Time Limit</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  <Info
                                    size={14}
                                    className="hover:text-blue-700 text-gray-400"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="text-sm text-center">
                                  {!isTimeLimit ? (
                                    <>
                                      Enable to set time limit for taking quiz.
                                      <br />
                                      Capped at 150mins
                                    </>
                                  ) : (
                                    "Set time limit"
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Switch
                            id="activate-time"
                            onCheckedChange={() => setIsTimeLimit(!isTimeLimit)}
                            className="flex-shrink"
                          />
                        </Label>
                        {isTimeLimit && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center space-x-2 pt-1"
                            >
                              <Label
                                className={`text-gray-700 transition-all ease-in-out transform duration-300`}
                                htmlFor="TimeLimit"
                              >
                                <Input
                                  id="timeLimit"
                                  value={timeLimit}
                                  min="1"
                                  max="150"
                                  type="number"
                                  name="timeLimit"
                                  className="max-w-[135px] w-[135px] text-sm"
                                  onChange={(e) => validateTimeLimit(e)}
                                />
                                minutes
                              </Label>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col mt-5">
                      <Label htmlFor="additionalInfo" className="mb-3">
                        Additional Instructions (Optional)
                      </Label>
                      <Textarea
                        id="additionalInfo"
                        className="text-sm"
                        placeholder="e.g., Test me on premise and assertion-type questions, Compare concepts X and Y, Ask strictly clinical correlations..."
                      />
                    </div>
                  </fieldset>
                </CardContent>
                <CardFooter className="bg-gray-50 py-6">
                  <Button
                    className="w-full bg-blue-600 text-white py-5 hover:bg-blue-700 cursor-pointer"
                    onSubmit={(e) => handleSubmission(e)}
                    disabled={isGenerating}
                  >
                    <CirclePlus />
                    Generate Quiz
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* See History and Saved */}
            <div className="mt-6 sm:mt-0 flex flex-col gap-6 sm:gap-3 sm:grid sm:grid-cols-2 sm:items-start lg:items-stretch lg:flex lg:flex-col">
              {/* Saved */}
              <Card>
                <CardHeader className="bg-yellow-50 p-5">
                  <CardTitle className="font-medium  text-yellow-800 flex items-center justify-between">
                    Saved Quizzes
                    <Save size={16} className="text-yellow-600" />
                  </CardTitle>
                </CardHeader>

                {/* Map the saved quizzes here or show that no saved quiz was found */}
                {isLoading ? (
                  ""
                ) : (
                  <CardContent className="px-0">
                    {!dashboardData.savedQuizzes.length ? (
                      <NoSavedQuiz />
                    ) : showFullSaved ? (
                      <MapSavedQuizzes showFullSav={true} />
                    ) : (
                      <MapSavedQuizzes showFullSav={false} />
                    )}
                  </CardContent>
                )}

                {isLoading ? (
                  // Skeleton loader
                  ""
                ) : (
                  <>
                    {dashboardData.savedQuizzes.length > 5 && (
                      <>
                        <div>
                          <Separator
                            className={`${showFullSaved && "hidden"}`}
                          />
                          <CardFooter
                            className={`bg-gray-50 py-4 ${
                              showFullSaved && "hidden"
                            }`}
                          >
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setShowFullSaved(!showFullSaved)}
                              className={`w-full justify-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm -mb-2 `}
                            >
                              View All Saved
                            </Button>
                          </CardFooter>
                        </div>
                      </>
                    )}
                  </>
                )}
              </Card>

              {/* History */}
              <Card>
                <CardHeader className="bg-purple-50 py-5">
                  <CardTitle className="font-medium  text-purple-800 flex items-center justify-between">
                    Quiz History
                    <Save size={16} className="text-purple-600" />
                  </CardTitle>
                </CardHeader>

                {/* Map the saved quizzes here or show that no saved quiz was found */}
                {isLoading ? (
                  ""
                ) : (
                  <CardContent className="px-0">
                    {!dashboardData.quizHistory.length ? (
                      <NoQuizHistory />
                    ) : showFullHistory ? (
                      <MapQuizHistory showfullHist={true} />
                    ) : (
                      <MapQuizHistory showfullHist={false} />
                    )}
                  </CardContent>
                )}

                {isLoading ? (
                  // Skeleton loader
                  ""
                ) : (
                  <>
                    {dashboardData.quizHistory.length > 5 && (
                      <>
                        <div>
                          <Separator
                            className={`${showFullHistory && "hidden"}`}
                          />
                          <CardFooter
                            className={`bg-gray-50 py-4 ${
                              showFullHistory && "hidden"
                            }`}
                          >
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() =>
                                setShowFullHistory(!showFullHistory)
                              }
                              className={`w-full justify-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm -mb-2 `}
                            >
                              View Full History
                            </Button>
                          </CardFooter>
                        </div>
                      </>
                    )}
                  </>
                )}
              </Card>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
