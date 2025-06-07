import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AppLogo from "@/components/AppLogo.jsx";
import NoSavedQuiz from "@/components/NoSavedQuiz.jsx";
import NoQuizHistory from "@/components/NoQuizHistory.jsx";
import MapSavedQuizzes from "@/components/SavedQuizz.jsx";
import MapQuizHistory from "@/components/QuizzHistory.jsx";
import Description from "@/components/AddedInfo.jsx";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CircleCheck,
  ClipboardList,
  Delete,
  FileStack,
  Gauge,
  History,
  InfoIcon,
  ListRestart,
  SaveIcon,
  Settings,
  Trash2,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { User } from "lucide-react";
import { CircleHelp } from "lucide-react";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as card from "@/components/ui/card";
import * as select from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ToolTip from "@/components/AddedInfo";
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
import { Link as Link2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import formatBytes from "@/utils/formatBytes";
import { X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import {
  ErrorToast,
  InfoToast,
  LoadingToast,
  SuccessToast,
} from "@/utils/toast";
import OverlayAnimation from "@/components/OverlayAnimation";
import Wait from "@/utils/wait";
import { refreshDCache } from "@/utils/refreshCache";

const WelcomeMsg = ({ dashboardData }) => {
  return (
    <>
      <div>
        <h1 className="font-bold text-3xl text-gray-800 max-[930px]:text-[clamp(1.5rem,_1rem_+_2.2vw,_2.2rem)] mt-6">
          Hello,{" "}
          <span className="text-blue-600">{dashboardData?.user.fName}</span>!
        </h1>
        <p className="sm:text-base">Let's get quizzing.</p>
      </div>
    </>
  );
};

const PreviouslyUploaded = ({ ...props }) => {
  console.log(props.prevUploads);
  return (
    <>
      <AnimatePresence>
        {props.prevUploads.length === 0 && "You have not uploaded any files"}
        <motion.div
          key="previously-uploaded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-md bg-gray-50 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all relative max-w-full"
        >
          <Label className="text-xs font-normal text-gray-500 sticky top-0 bg-gray-50 py-2 px-3 z-50 break-words">
            Select a file uploaded in the last 3 months:
          </Label>
          <div className="px-3 pb-3 mb-4 w-full">
            {console.log("The prevUploads before error: ", props.prevUploads)}
            {/* {console.log(
              "The uploadedFile object before error: ",
              props.selectedFile
            )} */}
            {props.prevUploads.map((upload) => {
              return (
                <Button
                  className="bg-transparent w-full hover:bg-gray-100 hover:scale-[1.01] max-w-full flex justify-between items-center px-1"
                  key={upload.fileId}
                  title={upload.fileName}
                  onClick={(e) => {
                    // set as selected
                    e.preventDefault();
                    console.log("TEH RANGE FOR THIS SEL: ", upload);
                    const extension = upload.fileName
                      .split(".")
                      .pop()
                      .toLowerCase();
                    props.setSelectedFile((prev) => ({
                      ...prev,
                      name: upload.fileName,
                      extension: extension,
                      size: formatBytes(upload.fileSize),
                      fileIconColor: props.getfileIconColor(upload.fileName),
                    }));
                    props.setUploadedFile((prev) => ({
                      ...prev,
                      status: true,
                      name: upload.fileName,
                      id: upload.fileId,
                      range: upload.range,
                    }));

                    // set display of prevUploads to false
                    props.setDisplayPrevUploads(false);

                    // set the userStart & end Page to fit the component
                    props.setUserStartPage(upload.range.start);
                    props.setUserEndPage(upload.range.end);
                  }}
                >
                  <div className="flex-1 flex gap-2 items-center min-w-0"> {/* Ensured min-w-0 for flex child */}
                    <FileText
                      className={`${props.getfileIconColor(
                        upload.fileName
                      )} w-6 flex-shrink-0`}
                      size={20}
                    />
                    {/* The user's original classes here were good for truncation within a flex item.
                        `inline-block` for Label, `truncate`, `flex-grow`, `w-[0px]` (basis 0) */}
                    <Label className="inline-block truncate flex-grow w-[0px] font-normal text-xs sm:text-sm text-gray-800 text-left">
                      {upload.fileName}
                    </Label>
                  </div>
                  <span className="text-gray-500 font-normal text-xs flex-shrink-0">
                    {formatBytes(upload.fileSize)}
                  </span>
                </Button>
              );
            })}
            {!props.prevUploads.length && (
              <>
                <Separator className="my-3" />
                <div className=" text-xs text-gray-700 text-left wrap-break-word">
                  0 files were found
                </div>
              </>
            )}
          </div>

          {/* </section> */}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// Main Exported Component
const Dashboard = () => {
  const inputElem = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [loadingFail, setLoadingFail] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [avScoreColor, setAvScoreColor] = useState({
    score: "",
    progress: "",
    border: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generateQuizData, setGenerateQuizData] = useState({});
  const [difficultyValue, setDifficultyValue] = useState("normal");
  const [modeValue, setModeValue] = useState("study");
  const [noOfQuestions, setNoOfQuestions] = useState("25"); // if you want a default value, this must be a string, not a number. The select field in the component has a value with string, not numbers. Therefore, this must also be a string
  const [timeLimit, setTimeLimit] = useState(20);
  const [isTimeLimit, setIsTimeLimit] = useState(false);
  const [showFullSaved, setShowFullSaved] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [uploadedFile, setUploadedFile] = useState({
    status: null,
    name: null,
    id: null,
    range: {
      start: null,
      end: null,
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    name: null,
    extension: null,
    fileIconColor: null,
    size: null,
  });
  const [userStartPage, setUserStartPage] = useState(0);
  const [userEndPage, setUserEndPage] = useState(0);
  const [uploadClassNames, setUploadClassNames] = useState("");
  const [uploadText, setUploadText] = useState("");
  const [displayPrevUploaded, setDisplayPrevUploads] = useState(false);
  const [prevUploads, setPrevUploads] = useState([]);
  const [triedToGetUploads, setTriedToGetUploads] = useState(false); // flag to check if user has once tried to get uploads. Prevents retrying again and again when prevUploads is []
  const [prevUploadsLoading, setPreviousUploadsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle, connecting, uploading, parsing file, success, error
  const [fileId, setFileId] = useState(null); // FileID to be received from the server on successful uploads
  const [errorMsg, setErrorMsg] = useState("");
  const startPageInput = useRef(null);
  const [rangeErrors, setRangeErrors] = useState({ start: "", end: "" });
  const [minMaxError, setMinMaxError] = useState("");
  const additionalInfo = useRef(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const controller = new AbortController();
  const APP_URL = import.meta.env.VITE_APP_URL; // Base URL of the app, used for navigation and redirects
  const apiUrl = import.meta.env.VITE_API_URL;

  // |-- Helper function for updating Upload Text and classnames--|
  const handleUploadTextClass = () => {
    if (selectedFile.name && uploadedFile.status === null) {
      // File has been selected but not uploaded
      const text = `Selected file: "${selectedFile.name}"`;
      setUploadText((prev) => (prev = text));
      setUploadClassNames("text-yellow-600");
    } else if (uploadedFile.status) {
      // File was uploaded successfully
      const text = `Your file, ${uploadedFile.name}, was uploaded successfully!`;
      setUploadText((prev) => (prev = text));
      const className = "text-green-600";
      setUploadClassNames(className);
    }
  };

  const overlayAnimation = (value) => {
    setIsOverlayVisible(value);
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    // Update input immediately
    setUserStartPage(value);

    // Validate on next tick to ensure state is updated
    setTimeout(() => validatePageRange("start", value), 0);
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    // Update input immediately
    setUserEndPage(value);

    // Validate on next tick
    setTimeout(() => validatePageRange("end", value), 0);
  };

  const validatePageRange = (type, value) => {
    const numericValue = Number(value);

    // Handle empty input by resetting the error and allowing temporary empty value
    if (value === "") {
      setRangeErrors((prev) => ({
        ...prev,
        [type]: "",
      }));
      return;
    }

    if (isNaN(numericValue)) {
      setRangeErrors((prev) => ({
        ...prev,
        [type]: "Please enter a valid number",
      }));
      return;
    }

    const serverMin = uploadedFile.range.start;
    const serverMax = uploadedFile.range.end;

    // Use a temporary start and end to compute the validated values
    let newStart = type === "start" ? numericValue : userStartPage;
    let newEnd = type === "end" ? numericValue : userEndPage;

    if (type === "start") {
      newStart = Math.min(Math.max(numericValue, serverMin), serverMax - 1);
      // if (newEnd <= newStart) {
      //   newEnd = Math.min(newStart + 1, serverMax);
      // }
    } else {
      // Use the current state's start to compute, but since we calculate newStart above,
      const currentStart = type === "end" ? userStartPage : newStart;
      // newEnd = Math.min(Math.max(numericValue, currentStart + 1), serverMax);
    }

    // Determine errors based on the input vs the clamped values
    const startError =
      type === "start" && newStart !== numericValue
        ? `Must be between ${serverMin}-${serverMax - 1}`
        : "";
    const endError =
      type === "end" && newEnd !== numericValue
        ? `Must be between ${userStartPage + 1}-${serverMax}`
        : "";

    // Update state and errors
    setUserStartPage(newStart);
    setUserEndPage(newEnd);
    setRangeErrors((prev) => ({
      ...prev,
      start: startError,
      end: endError,
    }));
  };

  // --- Helper function to reset both selected file and uploaded file ---
  const resetFile = () => {
    setSelectedFile((prev) => ({
      ...prev,
      name: null,
      extension: null,
      fileIconColor: null,
    }));

    setUploadedFile((prev) => ({
      ...prev,
      status: null,
      name: null,
      id: null,
      range: {
        start: null,
        end: null,
      },
    }));
  };

  const getfileIconColor = (name) => {
    const x = name.split(".").pop().toLowerCase();
    switch (x) {
      case "pdf":
        return "text-red-500";
      case "pptx":
      case "ppt":
        return "text-orange-500";
      case "txt":
        return "text-gray-500";
      case "docx":
      case "doc":
        return "text-blue-700";
      default:
        return "text-gray-800";
    }
  };

  const loadPrevUploaded = async (e) => {
    e.preventDefault();
    // check if is already displaying
    // if not displaying and prevUploads.length is not true, run a get request
    // if not displaying and prevUploads.length is true, just display from it
    // if displaying then set to false

    if (displayPrevUploaded) {
      setDisplayPrevUploads(false);
    } else if (
      !displayPrevUploaded &&
      !prevUploads.length &&
      !triedToGetUploads
    ) {
      setPreviousUploadsLoading(true);
      let response;
      try {
        response = await axios.get(`${apiUrl}/api/me/previous-uploads`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const prevUploaded = response.data;
        setDisplayPrevUploads(true); // show after fetch
        console.log(response.data);
        setPrevUploads(prevUploaded);
        setTriedToGetUploads(true); // set flag to true
      } catch (error) {
        console.log(error);
        if (error?.response?.data?.refresh) {
          const result = await refreshAccess();
          if (result) {
            return loadPrevUploaded(e);
          }
        }

        ErrorToast(`${error.response.status}: Error loading previous uploads`);
      } finally {
        setPreviousUploadsLoading(false);
      }
    } else if (!displayPrevUploaded) {
      setDisplayPrevUploads(true);
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
  const handleDropOrSelect = (event, drop) => {
    event.preventDefault();
    if (isGenerating || isUploading) return;
    let file;
    console.log("THIS IS FILE: ", file);
    if (drop) {
      setIsDragging(false);
      file = event.dataTransfer.files?.[0]; // Get only the first file
    } else {
      // File was selected manually
      console.log(event.target);
      file = event.target.files[0]; // get only the first file
    }

    if (file) {
      const MAX_ALLOWED_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size >= MAX_ALLOWED_SIZE) {
        // The equal sign is necessary. See server for details if needed
        InfoToast("file is too large. Max: 50MB");
        return;
      }

      const extension = file.name.split(".").pop().toLowerCase();
      console.log(
        "File Selected:",
        file.name,
        extension, // extension not to be trusted for any reason
        formatBytes(file.size)
      );

      setSelectedFile((prev) => ({
        ...prev,
        name: file.name,
        extension: extension,
        size: formatBytes(file.size),
      }));
      handleUploadTextClass();
      // Set img source. This displays an Icon signaling the entension
      setfileIconColor(extension);

      // Attempt upload
      const uploadFile = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const token = localStorage.getItem("token");
          const response = await axios.post(`${apiUrl}/api/upload`, formData, {
            onUploadProgress: (progressEvent) => {
              console.log(formatBytes(progressEvent.loaded))
              const percentUploaded = Math.round((progressEvent.loaded/file.size) * 100);
              if (percentUploaded >= 99) {
                setStatus("parsing file");
              }
              setProgress(percentUploaded);
            },
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

            const result = await response.data;
            console.log("Final HTTP Response Body: ", result);

            // Save as uploaded
            setUploadedFile((prev) => ({
              ...prev,
              status: true,
              name: file.name, // don't use selectedFile.name here since it is yet to be uploaded in state
              id: result.fileId,
              range: {
                start: result.range.start,
                end: result.range.end,
              },
            }));

            setUserStartPage(result.range.start);
            setUserEndPage(result.range.end);
            // Push newly uploaded file to previous uploads
            const newItem = {
              fileId: result.fileId,
              fileName: file.name,
              range: result.range,
              fileSize: result.fileSize,
            };
            setPrevUploads((prev) => [...prev, newItem]);
        } catch (error) {
          console.log(error);
          if (error?.response?.data?.refresh) {
            const x = await refreshAccess();
            if (x) {
              return await uploadFile();
            } else {
              await new Promise((resolve) =>
                resolve(setTimeout(ErrorToast("Session expired.")), 2500)
              );
              return navigate("/login");
            }
          }

          resetFile(); // reset selected

          
          setErrorMsg(
            error?.response?.data?.msg || error?.message ||
            "Error:  Unable to upload selected file."
          );
          ErrorToast(
            error?.response?.data?.msg ||  error?.message || 
            "Error:  Unable to upload selected file."
          );
        } finally {
          setProgress(0);
        }
      };

      uploadFile();
    }
  };

  const cancelUpload = () => {
      controller.abort();
      setIsUploading(false);
      setProgress(0);
      setStatus("idle");
      setErrorMsg("");
      resetFile(); // Reset selected file and uploaded file state
      InfoToast("Cancelled file upload.")
   };

  const clearUpload = (e) => {
    e.preventDefault();
    inputElem.defaultValue = undefined;
    // clear selected files and uploaded files state
    resetFile();
  };

  const setfileIconColor = (x) => {
    switch (x) {
      case "pdf":
        setSelectedFile((prev) => ({
          ...prev,
          fileIconColor: "text-red-500",
        }));
        break;
      case "pptx":
      case "ppt":
        setSelectedFile((prev) => ({
          ...prev,
          fileIconColor: "text-orange-500",
        }));
        break;
      case "txt":
        setSelectedFile((prev) => ({
          ...prev,
          fileIconColor: "text-gray-500",
        }));
        break;
      case "docx":
      case "doc":
        setSelectedFile((prev) => ({
          ...prev,
          fileIconColor: "text-blue-700",
        }));
        break;
      default:
        setSelectedFile((prev) => ({
          ...prev,
          fileIconColor: "text-gray-800",
        }));
    }
  };

  const getAvScoreColor = (pageData) => {
    const value = pageData.stats.averageScore.value;
    if (value >= 70) {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-green-700",
        progress: "[&>div]:bg-green-500",
        border: "border-green-100",
      }));
    } else if (value >= 50) {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-yellow-700",
        progress: "[&>div]:bg-yellow-500",
        border: "border-yellow-100",
      }));
    } else {
      setAvScoreColor((prevState) => ({
        ...prevState,
        score: "text-red-700",
        progress: "[&>div]:bg-red-700",
        border: "border-red-100",
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

  const handleSubmission = async (e) => {
    e.preventDefault();
    try {
      // Set generating state
      setIsGenerating(true);
      const response = await axios.post(
        `${apiUrl}/api/me/generate-quiz`,
        {
          fileId: uploadedFile.id,
          difficulty: difficultyValue,
          mode: modeValue,
          noOfQuestions: noOfQuestions,
          timeLimit: timeLimit,
          additionalInfo: additionalInfo.current.value,
          pageRange: {
            start: userStartPage,
            end: userEndPage,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const quizData = response.data;
      navigate(
        `${quizData.mode === "exam"
          ? `/quiz/e/${quizData.quizId}`
          : `/quiz/s/${quizData.quizId}`
        }`,
        { state: quizData }
      );
    } catch (error) {
      const response = error?.response?.data;
      if (response?.refresh) {
        const x = await refreshAccess();
        if (x) {
          return await handleSubmission(e);
        } else {
          ErrorToast("Session expired. Please login to continue.");
          await Wait();
          return navigate("/login");
        }
      }
      console.error(error);
      ErrorToast(
        response?.msg || response?.msgs[0].msg || error?.message || "An unexpected error occured."
      );
    } finally {
      setIsGenerating(false);
    }

    // Submit data for generation
  };

  useEffect(() => {
    const fetchData = async () => {

      try {
        const response = await axios.get(`${apiUrl}/api/users/me`, {
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Set Dashboard Data
        setDashboardData(response.data);
        localStorage.setItem('dashboardData', JSON.stringify(response.data));
        // Now that data is available, calc average score color
        getAvScoreColor(response.data);
        setIsLoading(false);
      } catch (error) {
        const responseObject = error?.response;
        if (error?.status === 429) {
          return ErrorToast("429: Too many requests.");
        }
        if (!responseObject) {
          /**
           * @todo  show retry button using react hot toast */
          return ErrorToast("Connection Problem. Please try again later.");
        }

        if (responseObject?.data?.refresh) {
          const success = await refreshAccess();
          if (success) {
            // if refresh was successful, retry request
            setIsLoading(true);
            return fetchData();
          } else {
            // if refresh failed, clear local storage and redirect to login
            ErrorToast("Session expired!");
            localStorage.clear("token");
            await Wait();
            return navigate("/login");
          }
        }

        // if there is no refresh flag, then set LoadingFail to true. This means that loading failed not due to token expiry but other reasons.
        if (responseObject?.status !== 401) {
          setLoadingFail(true);
          console.log("Error fetching data: ", responseObject);
          ErrorToast(responseObject?.data.msg);
          localStorage.clear();
          await Wait();
          return navigate("/login");
        }
      }
    };

    
    const fetchNewData = refreshDCache() 
    // Otherwise, we use data in localStorage
    if (fetchNewData) {
      fetchData();
    } else {
      const localData = localStorage.getItem('dashboardData');
      setDashboardData(JSON.parse(localData));
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {`${dashboardData?.user ? dashboardData?.user.fName.trim() : ""}
          ${dashboardData?.user
              ? dashboardData?.user.fName.endsWith("s")
                ? "'"
                : "'s"
              : ""
            } Dashboard -
          Quizzem`}
        </title>
      </Helmet>
      <div className="w-full max-w-full bg-gradient-to-b from-gray-50 to-blue-50">
        <header className="w-full grid grid-cols-2 items-center text-slate-500 shadow-sm px-4 md:px-8 py-4 sm:py-6 z-50 sticky top-0 backdrop-blur-sm bg-white/80">
          {isLoading ? (
            <Skeleton className="w-[80px] sm:w-[100px] h-[32px]" /> // Skeleton for AppLogo
          ) : (
            <AppLogo />
          )}

          <div className="flex justify-end items-center gap-2 md:gap-3">
            {" "}
            {/* Reduced gap on smaller screens */}
            {isLoading ? (
              // Skeleton for Avatar, Name, Email, Settings Dropdown
              <div className="flex items-center gap-2 md:gap-3">
                <Skeleton className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full" />{" "}
                {/* Smaller skeleton avatar on mobile */}
                <div className="hidden md:flex flex-col gap-1">
                  {" "}
                  {/* Hide text skeleton on mobile */}
                  <Skeleton className="w-[80px] h-[18px]" />
                  <Skeleton className="w-[120px] h-[14px]" />
                </div>
                {/* Show smaller name skeleton on mobile */}
                <div className="flex md:hidden flex-col gap-1">
                  <Skeleton className="w-[60px] h-[16px]" />
                </div>
                <Skeleton className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] rounded-md" />{" "}
                {/* Smaller skeleton icon on mobile */}
              </div>
            ) : (
              <>
                <Avatar className="border-2 border-blue-100 grow-0 size-10 md:size-12">
                  {" "}
                  {/* Smaller avatar on mobile */}
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-blue-500 text-white text-xs md:text-sm">
                    {" "}
                    {/* Smaller text in avatar on mobile */}
                    {dashboardData?.user.fName
                      ? `${dashboardData?.user.fName.slice(0, 1)}`
                      : "CN"}
                  </AvatarFallback>
                </Avatar>
                {/* Hide email on smaller screens */}
                <div className="hidden md:flex flex-col items-end">
                  <p className="font-medium text-gray-700 text-sm">
                    {" "}
                    {/* Adjusted text size */}
                    {dashboardData?.user.fName}
                  </p>
                  <p className="text-[12px]">{dashboardData?.user.email}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="size-8 md:size-9 inline-flex justify-center items-center p-1.5 md:p-2 rounded-md hover:bg-gray-100 whitespace-nowrap" // Adjusted size and padding
                    onMouseEnter={() => setSettingsHovered(true)}
                    onMouseLeave={() => setSettingsHovered(false)}
                  >
                    <Settings
                      size={18} // Explicit size, Tailwind size classes might conflict
                      color={
                        settingsHovered
                          ? "oklch(62.3% 0.214 259.815)"
                          : "#6a7282"
                      }
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mt-1 mr-2 md:mr-6">
                    {" "}
                    {/* Adjusted margin */}
                    <DropdownMenuLabel className="text-left">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Dropdown items remain largely the same, maybe adjust padding/font if needed */}
                    <div className="p-1 min-w-50">
                      <DropdownMenuItem className="flex p-2 items-center gap-4 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                        <User />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-4 p-2">
                        {" "}
                        {/* Added padding */}
                        <Settings className="size-4 shrink-0" />{" "}
                        {/* Explicit size */}
                        <span>Preferences</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex gap-4 items-center p-2">
                        {" "}
                        {/* Added padding */}
                        <CircleHelp className="size-4 shrink-0" />{" "}
                        {/* Explicit size */}
                        <span>Support</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={`${isLoading
                          ? "opacity-50"
                          : "text-red-500 flex gap-4 items-center hover:!bg-red-100 hover:!text-red-500"
                          } p-2`} // Added padding
                        disabled={isLoading}
                        onClick={async (e) => {
                          e.preventDefault();
                          const logout = async () => {
                            try {
                              setIsLoading(true);
                              await axios.get(`${apiUrl}/api/auth/logout`, {
                                withCredentials: true,
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token"
                                  )}`,
                                },
                              });
                              localStorage.clear();
                              SuccessToast("Logout success!");
                              await new Promise((resolve) =>
                                setTimeout(resolve, 2500)
                              );
                              setIsLoading(false);
                              navigate("/login");
                            } catch (error) {
                              console.log(error);
                              setIsLoading(false);
                              const refresh =
                                error?.response?.data.refresh === true;
                              if (refresh) {
                                const x = await refreshAccess();
                                if (x) {
                                  return await logout();
                                } else {
                                  ErrorToast("Error logging you out.");
                                }
                              }
                              ErrorToast("An error occurred.");
                            }
                          };
                          await logout();
                        }}
                      >
                        <LogOut className="size-4 shrink-0" />{" "}
                        {/* Explicit size */}
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

          <section className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-4 max-[420px]:grid-cols-1">
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
                <card.Card className="flex justify-between gap-5 shadow-sm border-blue-100 transition-all hover:scale-[1.02] min-h-[170px]">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row justify-between">
                      <div>
                        <span className="mr-2 text-sm max-[320px]:text-xs">
                          Quizzes Taken
                        </span>

                        <Description
                          text={
                            "Monthly quota of quizzes generated. This resets at the start of each month"
                          }
                        />
                      </div>
                      <ClipboardList
                        className="text-blue-500 opacity-80"
                        size={20}
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 py-1">
                      {dashboardData?.stats.quizzesTaken.value}{" "}
                      <span className="text-2xl md:text-3xl">/</span>{" "}
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

                <card.Card
                  className={`flex justify-between gap-5 shadow-sm border-red-100 transition-all hover:scale-[1.02] ${avScoreColor.border} min-h-[170px]`}
                >
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row justify-between">
                      <div>
                        <span className="mr-2 text-sm max-[320px]:text-xs">
                          Average Score
                        </span>
                        <Description text="The average score of all quizzes taken this month" />
                      </div>
                      <Gauge
                        className={`${avScoreColor.score} opacity-80`}
                        size={20}
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold py-1">
                      <span className={avScoreColor.score}>
                        {dashboardData?.stats.averageScore.value}
                        <span className="text-lg font-medium">%</span>
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

                <card.Card className="flex justify-between gap-5 hover:shadow-sm border-gray-100 hover:scale-[1.02] transition-all min-h-[170px]">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row justify-between">
                      <div>
                        <span className="mr-2 text-sm max-[320px]:text-xs">
                          Quiz Created
                        </span>
                        <Description
                          text={"Total number of quizzes ever created."}
                        />
                      </div>
                      <FileStack
                        className="text-gray-900 opacity-80"
                        size={20}
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-purple-700 py-1">
                      {dashboardData?.stats.quizzesCreated.value}
                    </card.CardTitle>
                  </card.CardHeader>
                </card.Card>

                <card.Card className="flex justify-between gap-5 hover:shadow-sm border-yellow-100 hover:scale-[1.02] transition-all min-h-[170px]">
                  <card.CardHeader>
                    <card.CardDescription className="flex flex-row justify-between">
                      <div>
                        <span className="mr-2 text-sm max-[320px]:text-xs">
                          Saved Quizzes
                        </span>
                        <ToolTip
                          text={"Total number of quizzes currently in saved"}
                        />
                      </div>
                      <SaveIcon
                        className="text-gray-900 opacity-80"
                        size={20}
                      />
                    </card.CardDescription>
                    <card.CardTitle className="text-2xl md:text-3xl font-bold text-yellow-700 py-1">
                      {dashboardData?.stats.savedQuizzes.value}
                    </card.CardTitle>
                  </card.CardHeader>
                  {/* <card.CardContent>
                    <Progress
                      value={dashboardData?.stats.savedQuizzes.value}
                      className="[&>div]:bg-yellow-500"
                    />
                  </card.CardContent> */}
                </card.Card>
              </>
            )}
          </section>

          {/* Generation and Quizzes Section */}
          <section className="grid lg:grid-cols-[2fr_1fr] gap-0 sm:gap-5 lg:mt-12 lg:relative lg:items-start">
            <card.Card className="shadow-lg lg:sticky lg:bottom-0">
              <form onSubmit={handleSubmission}>
                <card.CardHeader className="bg-gray-50 p-5">
                  <card.CardTitle className="font-medium text-base sm:text-lg">
                    Generate New Quiz
                  </card.CardTitle>
                  <card.CardDescription className="text-[13px]">
                    Upload a document or provide a URL to customize your quiz
                  </card.CardDescription>
                </card.CardHeader>

                <card.CardContent className="space-y-2">
                  <Label className="font-medium text-sm my-3 text-gray-700 flex justify-between ">
                    <span>Upload Document</span>
                    <Button
                      variant="outline"
                      onClick={(e) => loadPrevUploaded(e)}
                      className="text-xs px-2 py-1 cursor-pointer"
                      size={16}
                      disabled={isLoading || isGenerating}
                    >
                      {prevUploadsLoading ? (
                        <LoadingSpinner size={15} />
                      ) : (
                        <>
                          <ListRestart />{" "}
                          <span className="hidden md:inline-flex">
                            Use Previous
                          </span>
                        </>
                      )}
                    </Button>
                  </Label>
                  {displayPrevUploaded && (
                    <PreviouslyUploaded
                      prevUploads={prevUploads}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                      setUploadedFile={setUploadedFile}
                      setDisplayPrevUploads={setDisplayPrevUploads}
                      setUserStartPage={setUserStartPage}
                      setUserEndPage={setUserEndPage}
                      getfileIconColor={getfileIconColor}
                    />
                  )}

                  {/* Upload Area */}
                  <AnimatePresence>
                    <motion.div
                      key={selectedFile.name ? "file-selected" : "no-file"}
                      initial={{ opacity: 0, height: 0, y: 20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!selectedFile.name && !displayPrevUploaded && (
                        <div
                          className={`relative flex items-center justify-center w-full rounded-lg border-2 border-dashed border-gray-300 transition-all duration-200 mb-6 ${isDragging
                            ? "border-blue-500 bg-blue-50 scale-105 shadow-inner"
                            : "bg-white hover:bg-gray-50"
                            } ${isGenerating ? "cursor-not-allowed bg-gray-100" : ""
                            }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropOrSelect(e, true)}
                        >
                          {isGenerating && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                          )}
                          <label
                            htmlFor="file-dropzone"
                            disabled={isLoading}
                            aria-disabled={isLoading}
                            className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 p-4 text-center transition-colors ${!isLoading && "group"
                              } ${isGenerating
                                ? "cursor-not-allowed text-gray-400"
                                : isDragging
                                  ? "cursor-copy text-blue-600"
                                  : `cursor-pointer text-gray-500 ${!isLoading && "hover:bg-gray-50"
                                  }`
                              }`}
                          >
                            <CloudUpload
                              className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 transition-transform ${!isLoading && "group-hover:text-blue-600"
                                }  ${isDragging && !isGenerating
                                  ? "animate-bounce"
                                  : ""
                                } ${selectedFile.extension &&
                                selectedFile.fileIconColor &&
                                "hidden"
                                }`}
                            />

                            {!selectedFile.name ? (
                              <>
                                <p className="mb-1 text-xs sm:text-sm group-hover:text-blue-600">
                                  <span className="font-semibold group-hover:text-blue-600">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs group-hover:text-blue-600">
                                  PDF, DOCX, TXT, PPTX (MAX. 50MB)
                                </p>
                              </>
                            ) : (
                              <p
                                className={`text-sm ${uploadClassNames} font-medium flex items-center break-all px-2`}
                              >
                                <FileText
                                  size={16}
                                  className={`inline mr-1.5 shrink-0`}
                                />

                                {uploadText}
                              </p>
                            )}
                            <Input
                              ref={inputElem}
                              name="fileId"
                              id="file-dropzone"
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.doc,.txt,.ppt,.pptx"
                              disabled={isGenerating || isLoading}
                              onChange={(e) => handleDropOrSelect(e, false)}
                            />
                          </label>
                        </div>
                      )}
                      {!displayPrevUploaded && (
                        <>
                          {/* Only show this component when there is a selected file. This will be useful when user selects file from previously uploaded. 
      
      That is, we just show this again but change select status to true
       */}
                          {/* Make sure to clear the state for this to be cleared on error */}
                          {selectedFile.name && (
                            <section className="w-full bg-gray-50 py-4 px-4 rounded-md border space-y-3 max-w-full">
                              {/* For the top part */}
                              <div className="flex justify-between items-center w-full overflow-hidden">
                                <div className="flex flex-row items-center gap-3 flex-1 min-w-0 w-[80%] truncate">
                                  <FileText
                                    className={`${selectedFile.fileIconColor} w-6 flex-shrink-0`}
                                    size={20}
                                  />
                                  <div className="w-full">
                                    <p className="w-0 text-gray-800 font-medium whitespace-nowrap overflow-ellipsis text-xs sm:text-sm" title={selectedFile.name}>
                                      {selectedFile.name}
                                    </p>
                                    <p className="text-gray-500 text-xs block">
                                      {selectedFile.size}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  className="h-7 w-7 group hover:bg-red-100 bg-transparent border-none shadow-none align-top rounded-lg p-0 flex-shrink-0 ml-2"
                                  variant="outline"
                                  disabled={isGenerating || progress >= 99}
                                  onClick={
                                    (e) => {
                                      e.preventDefault();
                                      if (!isUploading && uploadedFile.id) { // When file is already uploaded and we are not uploading anymore
                                        clearUpload(e);
                                      } else {
                                        if (progress >= 99) {
                                          return
                                        } 
                                        cancelUpload();
                                      }
                                    }
                                  }
                                >
                                  {!isUploading && uploadedFile.id ? (
                                    <Trash2
                                      className="text-gray-500 group-hover:text-red-600"
                                      size={14}
                                    />
                                  ) : (
                                    <X
                                      className="text-gray-500 group-hover:text-red-600"
                                      size={14}
                                    />
                                  )}
                                </Button>
                              </div>

                              {uploadedFile.id ? (
                                <div className="w-full flex items-center gap-2 text-xs sm:text-sm text-green-600">
                                  <CircleCheck size={13} className="max-[500px]:flex-shrink-0" />
                                  <p className="truncate min-w-0 block whitespace-break-spaces overflow-ellipsis">{selectedFile.name} Uploaded Successfully!</p>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center gap-3 my-4">
                                  <Progress
                                    className="[&>*]:bg-blue-500"
                                    value={progress}
                                  />
                                  <div className="text-xs text-blue-600 font-semibold">
                                    {status === "parsing file" ? (
                                      <LoadingSpinner size={14} />
                                    ) : (
                                      progress + "%"
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* // Only show range when file has been uploaded */}
                              {/* If file uploaded is .txt, this range filled will not be displayed */}
                              {/* Last check sees that both start and end are not the same. some files may be just one page. In that case, don't display ts */}

                              {uploadedFile.id &&
                                uploadedFile.range.start !=
                                uploadedFile.range.end && (
                                  <motion.div
                                    // key="page-range" // Crucial for animation stability
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="pt-3 border-t border-gray-200"
                                  >
                                    <div className="space-y-3 text-gray-500">
                                      <Label className="text-xs text-gray-500">
                                        <span>
                                          Specify Page Range (Optional)
                                        </span>
                                        <ToolTip
                                          text={`This file ranges from page ${uploadedFile.range.start} to ${uploadedFile.range.end}`}
                                        />
                                      </Label>

                                      <div className="flex items-center gap-3">
                                        <Input
                                          name="start"
                                          value={userStartPage}
                                          onChange={handleStartChange}
                                          className="w-20 h-8 text-sm"
                                          disabled={isGenerating}
                                        // aria-invalid={!!rangeErrors.start}
                                        />
                                        <span className="text-gray-400">-</span>
                                        <Input
                                          name="end"
                                          value={userEndPage}
                                          onChange={handleEndChange}
                                          className="w-20 h-8 text-sm"
                                          disabled={isGenerating}
                                        // aria-invalid={!!rangeErrors.end}
                                        />
                                      </div>

                                      {rangeErrors.start && (
                                        <p className="text-xs text-red-500">
                                          {rangeErrors.start}
                                        </p>
                                      )}
                                      {rangeErrors.end && (
                                        <p className="text-xs text-red-500">
                                          {rangeErrors.end}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                            </section>
                          )}
                        </>
                      )}

                      {!selectedFile.name && !displayPrevUploaded && (
                        <div>
                          <div className="flex justify-between items-center gap-5 text-gray-500">
                            <Separator className="flex-1" />
                            <span className="text-xs">OR</span>
                            <Separator className="flex-1" />
                          </div>

                          {/* Section for adding file link */}
                          <div className="flex justify-between items-center gap-2 py-4">
                            <Link2 className="text-gray-400" />
                            <Input
                              placeholder="Place URL here (e.g., Public Webpage, Document Link)"
                              className="text-xs md:text-sm placeholder:!truncate"
                            />
                            <Button disabled={true} className="bg-blue-500 disabled:bg-gray-500">
                              🌝
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <Separator className={selectedFile.name && "my-6"} />

                  <fieldset
                    disabled={isGenerating || !uploadedFile.id}
                    className="my-5 disabled:opacity-80"
                  >
                    <h3 className="font-medium text-gray-800 text-sm">
                      Customize Quiz
                    </h3>
                    <div className="grid grid-rows-2 sm:grid-cols-2 sm:grid-rows-none sm:gap-8">
                      {/* Set Difficulty */}
                      <div className="mt-5">
                        <Label
                          className="flex items-center gap-3 mb-3 text-[13px]"
                          htmlFor="difficulty-group"
                        >
                          <span className="text-gray-700">Difficulty</span>
                          <ToolTip text="Normal offers standard questions. Select hard to attempt more complex phrasing and trickier options." />
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
                            className={`transition-all duration-500 text-sm ${difficultyValue == "normal"
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
                            className={`transition-all text-sm duration-500 ${difficultyValue == "hard"
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
                          className="flex items-center gap-3 mb-3 text-[13px]"
                          htmlFor="mode-group"
                        >
                          <span className="text-gray-700">Mode</span>
                          <ToolTip text="Study mode provides instant feedback. Exam mode show results only at the end." />
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
                            className={`transition-all duration-500 text-sm ${modeValue == "study"
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
                            className={`transition-all duration-500 text-sm ${modeValue == "exam"
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
                            <span className="text-[13px]">Number of Questions</span>
                            <ToolTip
                              text="Select Auto to generate as many high-yield
                                  questions as possible from the document. Questions are
                                  capped at 60"
                            />
                          </div>
                          <select.Select
                            name="noOfQuestions"
                            value={noOfQuestions}
                            onValueChange={(value) => {
                              // this is an onValueChnage handler. it gives a param of value NOT e
                              // When this value is "auto", disable time limit field, not the toggle
                              console.log(value);
                              setNoOfQuestions(value);
                            }}
                            disabled={
                              isGenerating || isLoading || !uploadedFile.id
                            }
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
                            <span className="text-[13px]">Time Limit</span>
                            <ToolTip
                              text={
                                !isTimeLimit ? (
                                  <>
                                    Enable to set a time limit.
                                    <br />
                                    Capped at 150mins
                                  </>
                                ) : (
                                  "Please note that if number of questions is set to auto, the model will auto generate the timeLimit"
                                )
                              }
                            />
                          </div>
                          <Switch
                            id="activate-time"
                            disabled={noOfQuestions === "auto" && true}
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
                                  disabled={noOfQuestions === "auto" && true}
                                  value={
                                    noOfQuestions === "auto" ? "" : timeLimit
                                  }
                                  min="1"
                                  max="150"
                                  type="number"
                                  className="max-w-[135px] w-[135px] text-sm"
                                  onChange={(e) => validateTimeLimit(e)}
                                />
                                <span
                                  className={`${noOfQuestions === "auto" && "text-gray-400"
                                    }`}
                                >
                                  minutes
                                </span>
                              </Label>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col mt-5">
                      <Label htmlFor="additionalInfo" className="mb-3 text-[13px]">
                        Additional Instructions (Optional)
                      </Label>
                      <Textarea
                        ref={additionalInfo}
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
                    className={`w-full bg-blue-600 text-white py-5 hover:bg-blue-700 cursor-pointer ${isGenerating &&
                      "bg-blue-50 border border-blue-500 text-blue-700 font-medium"
                      }`}
                    type="submit"
                    disabled={isGenerating || isLoading || !uploadedFile.id}
                  >
                    {isGenerating ? (
                      <div className="w-full flex justify-center items-center gap-3">
                        <LoadingSpinner size={16} />
                        <span>Generating your quiz. Please wait!</span>
                      </div>
                    ) : (
                      <>
                        <CirclePlus />
                        Generate Quiz
                      </>
                    )}
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
                            className={`bg-gray-50 py-4 ${showFullSaved && "hidden"
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
                    <>
                      <MapQuizHistory
                        showfullHist={true}
                        dashboardData={dashboardData}
                        overlayAnimation={overlayAnimation}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                      />
                    </>
                  ) : (
                    <MapQuizHistory
                      showfullHist={false}
                      dashboardData={dashboardData}
                      overlayAnimation={overlayAnimation} // make sure this is here else for some reason the function won't be passed to child
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
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
                            className={`bg-gray-50 py-4 ${showFullHistory && "hidden"
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
          <ToastContainer className="w-[200px]" />
        </main>
        <OverlayAnimation isVisible={isOverlayVisible} />
      </div>
    </>
  );
};

export default Dashboard;