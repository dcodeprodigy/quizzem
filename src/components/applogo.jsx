import React from "react";
import { useNavigate } from "react-router-dom";

const AppLogo = () => {
  const navigate = useNavigate();
      return (
        <>
          <p className="font-bold text-blue-600 text-2xl md:text-3xl cursor-default" onClick={() => {
            navigate("/dashboard")
          }}>
            QUIZZEM
          </p>
        </>
      );
};

export default AppLogo;