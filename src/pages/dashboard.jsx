import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLogo from "@/components/AppLogo";
import NoSavedQuiz from "@/components/nosavedquiz";
import NoQuizHistory from "@/components/noquizhistory";
import MapSavedQuizzes from "@/components/SavedQuizz";
import MapQuizHistory from "@/components/QuizzHistory";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, InfoIcon, Settings, UploadCloud } from "lucide-react";
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
import * as card from "@/components/ui/card";
import * as tooltip from "@/components/ui/tooltip";
import * as select from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
import { Skeleton } from "@/components/ui/skeleton";
import refreshAccess from "@/utils/refreshAccess";
import { Navigate } from "react-router-dom";

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

const ToolTip = ({ text }) => {
  return (
    <tooltip.TooltipProvider>
      <tooltip.Tooltip>
        <tooltip.TooltipTrigger className="cursor-help">
          <Info size={13} className="hover:text-blue-700" />
        </tooltip.TooltipTrigger>
        <tooltip.TooltipContent className="text-sm max-w-[200px] text-center">
          <p>{text}</p>
        </tooltip.TooltipContent>
      </tooltip.Tooltip>
    </tooltip.TooltipProvider>
  );
};

// Main Exported Component
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [loadingFail, setLoadingFail] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [avScoreColor, setAvScoreColor] = useState({ score: "", progress: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generateQuizData, setGenerateQuizData] = useState({});
  const [difficultyValue, setDifficultyValue] = useState("normal");
  const [modeValue, setModeValue] = useState("study");
  const [noOfQuestions, setNoOfQuestions] = useState();
  const [timeLimit, setTimeLimit] = useState(20);
  const [isTimeLimit, setIsTimeLimit] = useState(false);
  const [showFullSaved, setShowFullSaved] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [uploadedFile, setUploadedFile] = useState({
    status: null,
    name: null,
    id: null,
    errMsg: null,
  });
  const [selectedFile, setSelectedFile] = useState({name: null, extension: null, fileSrc: null});
  const [uploadClassNames, setUploadClassNames] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [fileSrc, setFileSrc] = useState(null);
  const [fileExtension, setFileExtension] = useState();

  // |-- Helper function for updating Upload Text and classnames--|
  const handleUploadTextClass = () => {
    if (selectedFile.name && uploadedFile.status === null) {
      // File has been selected but not uploaded
      const text = `Selected file: "${selectedFile.name}"`
      setUploadText((prev) => prev = text);
      setUploadClassNames("text-yellow-600");
    } else if (uploadedFile.status) {
      // File was uploaded successfully
      const text = `Your file, ${uploadedFile.name}, was uploaded successfully!`
      setUploadText(
        (prev) => prev = text
      );
      const className = "text-green-600";
      setUploadClassNames(className);
    } else if (selectedFile.name && uploadedFile.status === false) {
      // File upload failed
      setUploadText(
        `${uploadedFile.errMsg || "An error occured while uploading your file"}`
      );
      setUploadClassNames("text-red-600");
    }
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
      const extension = file.name.split(".").pop().toLowerCase();
      console.log("File dropped:", file.name, extension);
      setSelectedFile((prev) => ({
        ...prev,
        name: file.name,
        extension: extension
      }));
      handleUploadTextClass();
      // Set img Src
      setImgSrc(extension);
    }
  };

  const setImgSrc = (x) => {
    switch (x) {
      case "pdf":
        setSelectedFile((prev) => ({
          ...prev,
          fileSrc: "/images/pdf.png"
        }));
      case "pptx" || "ppt":
        setSelectedFile((prev) => ({
          ...prev,
          fileSrc: "/images/pptx.png"
        }));
      case "txt":
        setSelectedFile((prev) => ({
          ...prev,
          fileSrc: "/images/txt.png"
        }));
      case "docx" || "doc":
        setSelectedFile((prev) => ({
          ...prev,
          fileSrc: "/images/doc.png"
        }));
      default:
        break;
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
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
        console.log(response);

        // Set Dashboard Data
        setDashboardData(response.data);

        // Now that data is available, calc average score color
        getAvScoreColor(response.data);
      } catch (error) {
        const responseObject = error.response;
        console.log("resobj", responseObject);

        if (responseObject.data.refresh) {
          const success = await refreshAccess();
          if (success) {
            // if refresh was successful, retry request
            setIsLoading(true);
            return fetchData();
          } else {
            // if refresh failed, clear local storage and redirect to login
            localStorage.clear("token");
            return navigate("/login");
          }
        }

        // if there is no refresh flag, then set LoadingFail to true. This means that loading failed not due to token expiry but other reasons.
        if (responseObject.status !== 401) {
          setLoadingFail(true);
          console.log("Error fetching data: ", responseObject);
        } else {
          console.log("Token expired or invalid. Redirecting to login...");
          localStorage.clear("token");
          navigate("/login");
        }
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
          {isLoading ? (
            <Skeleton className="w-[100px] h-[32px]" /> // Skeleton for AppLogo
          ) : (
            <AppLogo />
          )}

          <div className="flex justify-end items-center flex-end gap-3">
            {isLoading ? (
              // Skeleton for Avatar, Name, Email, Settings Dropdown
              <div className="flex items-center gap-3">
                <Skeleton className="w-[40px] h-[40px] rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="w-[80px] h-[18px]" />
                  <Skeleton className="w-[120px] h-[14px]" />
                </div>
                <Skeleton className="w-[36px] h-[36px] rounded-md" />
              </div>
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
                      <DropdownMenuItem
                        className="text-red-500 flex gap-4 items-center hover:!bg-red-100 hover:!text-red-500"
                        onClick={() => {
                          localStorage.clear("token");
                          navigate("/login");
                        }}
                      >
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

        <main className="px-4 md:px-8 py-2 pb-8">
          {isLoading ? (
            <div className="my-4">
              <Skeleton className="w-1/3 h-8 mb-2" />
              <Skeleton className="w-1/2 h-6" />
            </div>
          ) : (
            <WelcomeMsg dashboardData={dashboardData} />
          )}

          <section className="my-8 grid grid-cols-2 gap-3 lg:grid-cols-4 max-[420px]:grid-cols-1">
            {isLoading ? (
              // Skeleton for 4 Stat Cards
              Array.from({ length: 4 }).map((_, index) => (
                <card.Card key={`stat-skeleton-${index}`}>
                  <card.CardHeader>
                    <Skeleton className="w-2/3 h-4 mb-2" />{" "}
                    {/* CardDescription */}
                    <Skeleton className="w-1/2 h-8 py-1" /> {/* CardTitle */}
                  </card.CardHeader>
                  <card.CardContent>
                    <Skeleton className="w-full h-2" /> {/* Progress */}
                  </card.CardContent>
                </card.Card>
              ))
            ) : (
              // Actual Stat Cards
              <>
                <card.Card className="hover:shadow-md ">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row">
                      <span className="mr-2 text-sm max-[320px]:text-xs">
                        Quizzes Taken
                      </span>

                      <ToolTip
                        text={
                          "Monthly quota of quizzes generated. This resets at the start of each month"
                        }
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 py-1">
                      {dashboardData?.stats.quizzesTaken.value}{" "}
                      <span className="text-lg">of</span>{" "}
                      {dashboardData?.stats.quizMonthlyQuota.value}
                    </card.CardTitle>
                  </card.CardHeader>
                  <card.CardContent>
                    <Progress
                      value={
                        (dashboardData?.stats.quizzesTaken.value /
                          dashboardData?.stats.quizMonthlyQuota.value) *
                        100
                      }
                      className="[&>div]:bg-blue-500"
                    />
                  </card.CardContent>
                </card.Card>

                <card.Card className="hover:shadow-md">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row">
                      <span className="mr-2 text-sm max-[320px]:text-xs">
                        Average Score
                      </span>
                      <ToolTip text="The average score of all quizzes taken this month" />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold py-1">
                      <span className={avScoreColor.score}>
                        {dashboardData?.stats.averageScore.value}%
                      </span>
                    </card.CardTitle>
                  </card.CardHeader>
                  <card.CardContent>
                    <Progress
                      value={dashboardData?.stats.averageScore.value}
                      className={avScoreColor.progress}
                    />
                  </card.CardContent>
                </card.Card>

                <card.Card className="hover:shadow-md">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row">
                      <span className="mr-2 text-sm max-[320px]:text-xs">
                        Quizzes Created
                      </span>
                      <ToolTip text={"Total number of quizzes ever created."} />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-purple-700 py-1">
                      {dashboardData?.stats.quizzesCreated.value}
                    </card.CardTitle>
                  </card.CardHeader>
                  <card.CardContent>
                    <Progress
                      value={dashboardData?.stats.quizzesCreated.value}
                      className="[&>div]:bg-purple-500"
                    />
                  </card.CardContent>
                </card.Card>

                <card.Card className="hover:shadow-md">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row">
                      <span className="mr-2 text-sm max-[320px]:text-xs">
                        Saved Quizzes
                      </span>
                      <ToolTip
                        text={"Total number of quizzes currently in saved"}
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-yellow-700 py-1">
                      {dashboardData?.stats.savedQuizzes.value}
                    </card.CardTitle>
                  </card.CardHeader>
                  <card.CardContent>
                    <Progress
                      value={dashboardData?.stats.savedQuizzes.value}
                      className="[&>div]:bg-yellow-500"
                    />
                  </card.CardContent>
                </card.Card>
              </>
            )}
          </section>

          {/* Generation and Quizzes Section */}
          <section className="grid lg:grid-cols-[2fr_1fr] gap-0 sm:gap-5 lg:mt-12 lg:relative lg:items-start">
            {/* Generate Quiz Card - Assuming this doesn't need a skeleton based on main isLoading */}
            <card.Card className="shadow-lg lg:sticky lg:bottom-0">
              <form>
                <card.CardHeader className="bg-gray-50 p-5">
                  <card.CardTitle className="font-medium text-lg">
                    Generate New Quiz
                  </card.CardTitle>
                  <card.CardDescription>
                    Upload a document and customize your quiz
                  </card.CardDescription>
                </card.CardHeader>

                <card.CardContent>
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
                        } ${selectedFile.extension && selectedFile.fileSrc && "hidden"}`}
                      />
                      <img
                        src={selectedFile.extension && selectedFile.fileSrc}
                        className={`hidden ${
                          selectedFile.extension &&
                          selectedFile.fileSrc &&
                          "block w-8 h-8 sm:w-10 sm:h-10 mb-3"
                        }`}
                      />
                      {!selectedFile.name ? (
                        <>
                          <p className="mb-1 text-xs sm:text-sm">
                            <span className="font-semibold hover:text-blue-300 hover:underline">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs">
                            PDF, DOCX, TXT, PPTX (MAX. 50MB)
                          </p>
                        </>
                      ) : (
                        <p
                          className={`text-sm ${uploadClassNames} font-medium flex items-center break-all px-2`}
                        >
                          <FileText
                            size={16}
                            className="inline mr-1.5 shrink-0"
                          />

                          {uploadText}
                        </p>
                      )}
                      <Input
                        name="fileId"
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
                          <tooltip.TooltipProvider>
                            <tooltip.Tooltip>
                              <tooltip.TooltipTrigger className="cursor-help">
                                <Info
                                  size={14}
                                  className="hover:text-blue-700 text-gray-400"
                                />
                              </tooltip.TooltipTrigger>
                              <tooltip.TooltipContent className="text-sm">
                                Normal offers standard questions. <br />
                                Select hard to attempt more complex phrasing{" "}
                                <br />
                                and trickier options.
                              </tooltip.TooltipContent>
                            </tooltip.Tooltip>
                          </tooltip.TooltipProvider>
                        </Label>

                        <ToggleGroup
                          name="difficulty"
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
                          <tooltip.TooltipProvider>
                            <tooltip.Tooltip>
                              <tooltip.TooltipTrigger className="cursor-help">
                                <Info
                                  size={14}
                                  className="hover:text-blue-700 text-gray-400"
                                />
                              </tooltip.TooltipTrigger>
                              <tooltip.TooltipContent className="text-sm">
                                Study mode provides instant feedback. <br />
                                Exam mode show results only at the end. <br />
                                and trickier options.
                              </tooltip.TooltipContent>
                            </tooltip.Tooltip>
                          </tooltip.TooltipProvider>
                        </Label>

                        <ToggleGroup
                          name="mode"
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
                          htmlFor="noOfQuestions"
                        >
                          <div className="text-gray-700 flex items-center gap-3 mb-3">
                            <span>Number of Questions</span>
                            <tooltip.TooltipProvider>
                              <tooltip.Tooltip>
                                <tooltip.TooltipTrigger className="cursor-help">
                                  <Info
                                    size={14}
                                    className="hover:text-blue-700 text-gray-400"
                                  />
                                </tooltip.TooltipTrigger>
                                <tooltip.TooltipContent className="text-sm">
                                  Select Auto to generate as many high-yield
                                  questions <br />
                                  as possible from the document. Questions are
                                  capped at 100
                                </tooltip.TooltipContent>
                              </tooltip.Tooltip>
                            </tooltip.TooltipProvider>
                          </div>
                          <select.Select
                            name="noOfQuestions"
                            value={noOfQuestions}
                            onChange={(e) => setNoOfQuestions(e.current.value)}
                          >
                            <select.SelectTrigger
                              className="max-w-[135px] w-[135px] !text-gray-700"
                              id="noOfQuestions"
                            >
                              <select.SelectValue placeholder="Select" />
                            </select.SelectTrigger>
                            <select.SelectContent className="text-gray-500">
                              <select.SelectItem value="auto">
                                Auto
                              </select.SelectItem>
                              <select.SelectItem value="10">
                                10
                              </select.SelectItem>
                              <select.SelectItem value="25">
                                25
                              </select.SelectItem>
                              <select.SelectItem value="40">
                                40
                              </select.SelectItem>
                            </select.SelectContent>
                          </select.Select>
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
                            <tooltip.TooltipProvider>
                              <tooltip.Tooltip>
                                <tooltip.TooltipTrigger className="cursor-help">
                                  <Info
                                    size={14}
                                    className="hover:text-blue-700 text-gray-400"
                                  />
                                </tooltip.TooltipTrigger>
                                <tooltip.TooltipContent className="text-sm text-center">
                                  {!isTimeLimit ? (
                                    <>
                                      Enable to set time limit for taking quiz.
                                      <br />
                                      Capped at 150mins
                                    </>
                                  ) : (
                                    "Set time limit"
                                  )}
                                </tooltip.TooltipContent>
                              </tooltip.Tooltip>
                            </tooltip.TooltipProvider>
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
                                htmlFor="timeLimit"
                              >
                                <Input
                                  name="timeLimit"
                                  id="timeLimit"
                                  value={timeLimit}
                                  min="1"
                                  max="150"
                                  type="number"
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
                        name="additionalInfo"
                        id="additionalInfo"
                        className="text-sm"
                        placeholder="e.g., Test me on premise and assertion-type questions, Compare concepts X and Y, Ask strictly clinical correlations..."
                      />
                    </div>
                  </fieldset>
                </card.CardContent>
                <card.CardFooter className="bg-gray-50 py-6">
                  <Button
                    className="w-full bg-blue-600 text-white py-5 hover:bg-blue-700 cursor-pointer"
                    onSubmit={(e) => handleSubmission(e)}
                    disabled={isGenerating || isLoading}
                  >
                    <CirclePlus />
                    Generate Quiz
                  </Button>
                </card.CardFooter>
              </form>
            </card.Card>

            {/* See History and Saved */}
            <div className="mt-6 sm:mt-0 flex flex-col gap-6 sm:gap-3 md:grid md:grid-cols-2 md:items-start lg:items-stretch lg:flex lg:flex-col">
              {/* Saved */}
              <card.Card>
                <card.CardHeader className="bg-yellow-50 p-5">
                  <card.CardTitle className="font-medium  text-yellow-800 flex items-center justify-between">
                    Saved Quizzes
                    <Save size={16} className="text-yellow-600" />
                  </card.CardTitle>
                </card.CardHeader>

                <card.CardContent className="px-0">
                  {isLoading ? (
                    // Skeleton loader for Saved Quizzes List
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`saved-skel-${index}`}
                          className="flex items-center space-x-3"
                        >
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      ))}
                    </div>
                  ) : !dashboardData?.savedQuizzes?.length ? (
                    <NoSavedQuiz />
                  ) : showFullSaved ? (
                    <MapSavedQuizzes
                      showFullSav={true}
                      dashboardData={dashboardData}
                    />
                  ) : (
                    <MapSavedQuizzes
                      showFullSav={false}
                      dashboardData={dashboardData}
                    />
                  )}
                </card.CardContent>

                {isLoading ? (
                  // Skeleton loader for "View All" button area if needed
                  <div className="p-4">
                    <Skeleton className="w-full h-6" />
                  </div>
                ) : (
                  <>
                    {dashboardData?.savedQuizzes?.length > 5 && (
                      <>
                        <div>
                          <Separator
                            className={`${showFullSaved && "hidden"}`}
                          />
                          <card.CardFooter
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
                          </card.CardFooter>
                        </div>
                      </>
                    )}
                  </>
                )}
              </card.Card>

              {/* History */}
              <card.Card>
                <card.CardHeader className="bg-purple-50 py-5">
                  <card.CardTitle className="font-medium  text-purple-800 flex items-center justify-between">
                    Quiz History
                    <History size={16} className="text-purple-600" />
                  </card.CardTitle>
                </card.CardHeader>

                <card.CardContent className="px-0">
                  {isLoading ? (
                    // Skeleton loader for Quiz History List
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={`hist-skel-${index}`}
                          className="flex items-center space-x-3"
                        >
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      ))}
                    </div>
                  ) : !dashboardData?.quizHistory?.length ? (
                    <NoQuizHistory />
                  ) : showFullHistory ? (
                    <MapQuizHistory
                      showfullHist={true}
                      dashboardData={dashboardData}
                    />
                  ) : (
                    <MapQuizHistory
                      showfullHist={false}
                      dashboardData={dashboardData}
                    />
                  )}
                </card.CardContent>

                {isLoading ? (
                  // Skeleton loader for "View All" button area if needed
                  <div className="p-4">
                    <Skeleton className="w-full h-6" />
                  </div>
                ) : (
                  <>
                    {dashboardData?.quizHistory?.length > 5 && (
                      <>
                        <div>
                          <Separator
                            className={`${showFullHistory && "hidden"}`}
                          />
                          <card.CardFooter
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
                          </card.CardFooter>
                        </div>
                      </>
                    )}
                  </>
                )}
              </card.Card>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
