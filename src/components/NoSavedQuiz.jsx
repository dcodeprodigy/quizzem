import React from "react";
import { FileSearch } from "lucide-react";


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

  export default NoSavedQuiz
