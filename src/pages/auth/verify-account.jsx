import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import OverlayAnimation from "@/components/OverlayAnimation.jsx";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingDots from "@/components/LoadingDots.jsx";

const VerifyAccount = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState({
    status: null,
    msg: "",
  });
  const { token: token } = useParams(); // Get the token param from the URL
  const [searchParams, setSearchParams] = useSearchParams(); // Get the email query string from the URL

  const setResponseFromServer = (res) => {
    setServerResponse((prev) => ({
      ...prev,
      status: res.status,
      msg: res.data.msg,
    }));
    return;
  };

  const getImageAltText = () => {
    if (serverResponse.status === 200) {
      return "Email Verified!";
    } else if (serverResponse.status === 202) {
      return "Check inbox for verification email";
    } else {
      return "An error occured";
    }
  };

  const getImageUrl = () => {
    if (serverResponse.status === 200) {
      return "/images/email-verified-icon.png";
    } else if (serverResponse.status === 202) {
      return "/images/verify-mail-icon.png";
    } else {
      return "/images/expired-link-icon.png";
    }
  };

  useEffect(() => {
    const verifyAccount = async () => {
      // Send Request to Verify Account
      try {
        const response = await axios.post(
          `${apiUrl}/api/auth/verify-account/${token}`
        );

        // Set Server Response
        console.log(response)
        setResponseFromServer(response);

        // Set Access token in local storage
        response.data.token &&
          localStorage.setItem("token", response.data.token);
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying account:", error);
        setResponseFromServer(error.response);
        setIsLoading(false);
      }
      return;
    };

    verifyAccount();
  }, []);

  const resendVerification = async () => {
    setIsLoading(true);
    console.log(searchParams.get("e"));
    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/resend-verification`,
        {
          e: searchParams.get("e"),
        }
      );

      setResponseFromServer(response);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setResponseFromServer(error.response);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="contaner p-2 m-auto flex flex-col items-center justify-center h-screen">
      <Helmet>
        <title>Verify Your Account - Quizzem</title>
      </Helmet>
        {!isLoading && (
          <div className="w-[95%] max-w-2xl bg-white mx-auto px-8 py-12 rounded-2xl shadow-xs text-center text-gray-800 relative overflow-hidden">
            {/* Subtle blur gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-transparent to-transparent backdrop-blur-sm rounded-2xl pointer-events-none z-0"></div>

            {/* Main content */}
            <div className="relative z-10">
              <img
                src={getImageUrl()}
                alt={getImageAltText()}
                className="mx-auto mb-1 max-w-40 max-h-40 object-contain flex-shrink"
              />

              <h2 className="text-xl font-semibold text-blue-500 mb-1">
                {serverResponse.msg}
              </h2>

              <p className="mb-6 text-gray-700 text-sm">
                {serverResponse.status === 400
                  ? "The link you clicked has either expired or is invalid."
                  : serverResponse.status >= 500 &&
                    "An error occured."}
              </p>

              <Button
                className={`text-sm inline-block bg-blue-500 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-600 transition ${
                  isLoading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={async () => {
                  serverResponse.status === 200
                    ? navigate("/login")
                    : serverResponse.status === 202 ? navigate("/login") : await resendVerification();
                }}
                disabled={isLoading}
              >
                {serverResponse.status === 200 ? (
                  "Proceed to Login"
                ) : isLoading ? (
                  <LoadingDots />
                ) : serverResponse.status === 202 ? (
                  "Ok! Got it"
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      <OverlayAnimation isVisible={isLoading} />
    </>
  );
};

export default VerifyAccount;
