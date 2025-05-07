import React, { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Slider from "@/components/Slider.jsx";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast, Flip } from "react-toastify";
import { LoadingToast } from "@/utils/toast";
import Wait from "@/utils/wait";


const Tags = () => {
  return (
    <Helmet>
      <title>Register for Quizzem - Test Your Knowledge</title>
    </Helmet>
  );
};

const LeftSection = () => {
  return (
    <>
      <p className="text-2xl font-bold m-6 text-blue-600">QUIZZEM</p>
      {/* Slide show */}
      <Slider />
    </>
  );
};

function displayLoadingToast(msg) {
  return toast.loading(msg, {
    position: "bottom-center",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
}

const SignupPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const formRef = useRef();
  const [errors, setErrors] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [pending, setPending] = useState(true);
  const [formState, setFormState] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
  });

  const triggerSignup = async (e) => {
    e.preventDefault();
    let toastId;

    try {
      toastId = displayLoadingToast("Hang tight while we sign you up...");

      const response = await axios.post(
        `${apiUrl}/api/auth/signup`,
        {
          fName: formState.fName,
          lName: formState.lName,
          email: formState.email,
          password: formState.password,
        },
        {
          timeout: 30000
        }
      );

      toastId = toast.update(toastId, {
        render: "Signup successful! Check your email address to verify your account.",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      await Wait(4500);
      navigate("/login");
    } catch (error) {
      // console.log(error);
      const response = error?.response?.data;
      if (!response) {
        return LoadingToast("Network error: Please check your internet connection and try again.", toastId, "error");
      }

      // append errors to state
      if (response.msgs) {
        toastId = toast.update(toastId, {
          render: "Input validation failed.",
          isLoading: false,
          type: "error",
          autoClose: 3000,
        });

        response.msgs.map((msg) => {
          return setErrors((prevErrors) => ({
            ...prevErrors,
            [msg.path]: msg.msg,
          }));
        });
        return
      } else {
        // Toast Notification
        toastId = toast.update(toastId, {
          render: response.msg,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return
      }
    }
  };

  return (
    <>
      <Tags />
        <>
          <main className="bg-gray-50 flex items-center justify-center max-w-screen text-slate-600 text-[14px]">
            {/* Division for the grid items  */}
            <div className="rounded-2xl shadow-xl bg-white w-[95%] max-w-[1024px] px-8 my-8 grid grid-cols-1 min-[930px]:grid-cols-2">
              {/* Left Hand Section */}
              <section className="hidden min-[930px]:block bg-gradient-to-br py-12 px-6">
                <LeftSection />
              </section>

              {/* Right Hand Section */}
              <section className="md:px-12 md:py-12">
                <div className="flex justify-end items-center gap-3 my-8">
                  <span>Already have an account?</span>
                  <Button
                    variant="outline"
                    className="text-black bg-white outline-1 cursor-pointer"
                    size="sm"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                </div>

                <form className="my-5" ref={formRef} onSubmit={triggerSignup}>
                  <div className="mb-5">
                    <h1 className="font-bold text-3xl text-black max-[930px]:text-[clamp(1.5rem,_1rem_+_2.2vw,_2.2rem)]">
                      Welcome to QUIZZEM
                    </h1>
                    <p className="my-2">
                      Register your account to start quizzing.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="fName" className="font-medium mt-1">
                      Enter Name
                    </label>
                    {/* Name Section */}
                    <div className="flex gap-3 mt-2 mb-4 ">
                      <div className="flex-1 flex flex-col">
                        <Input
                          placeholder="First Name"
                          name="fName"
                          className="h-11 text-[14px]"
                          disabled={isRequesting}
                          onChange={(e) => {
                            setFormState((prevState) => ({
                              ...prevState,
                              fName: e.target.value,
                            }));
                            // Reset error message
                            setErrors((prevState) => ({
                              ...prevState,
                              fName: "",
                            }));
                            console.log(formState);
                          }}
                        />

                        <Label
                          className={`text-red-500 text-xs mt-2 ${
                            errors.fName ? "block" : "hidden"
                          }`}
                        >
                          {errors?.fName}
                        </Label>
                      </div>

                      <div className="flex-1 flex flex-col">
                        <Input
                          placeholder="Last Name (Optional)"
                          name="lName"
                          className="h-11 text-[14px]"
                          disabled={isRequesting}
                          onChange={(e) => {
                            setFormState((prevState) => ({
                              ...prevState,
                              lName: e.target.value,
                            }));

                            // Reset error message
                            setErrors((prevState) => ({
                              ...prevState,
                              lName: "",
                            }));
                          }}
                        />
                        <Label
                          className={`text-red-500 text-xs ${
                            errors.lName ? "block" : "hidden"
                          }`}
                        >
                          {errors?.lName}
                        </Label>
                      </div>
                    </div>

                    <label htmlFor="email" className="font-medium mt-1">
                      Enter Email
                    </label>

                    <Input
                      placeholder="youremail@example.com"
                      name="email"
                      type="email"
                      className={`mb-4 ${
                        errors.email && "mb-0"
                      } mt-2 h-11 text-[14px]`}
                      disabled={isRequesting}
                      onChange={(e) => {
                        setFormState((prevState) => ({
                          ...prevState,
                          email: e.target.value,
                        }));
                        // Reset error message
                        setErrors((prevState) => ({
                          ...prevState,
                          email: "",
                        }));
                      }}
                    />

                    <Label
                      className={`text-red-500 text-xs my-2 ${
                        errors.email ? "block" : "hidden"
                      }`}
                    >
                      {errors?.email}
                    </Label>

                    <label htmlFor="setPwd" className="font-medium mt-1">
                      Set Password
                    </label>
                    <Input
                      placeholder="••••••••••••"
                      type="password"
                      name="password"
                      className="mb-4 mt-2 h-11 text-[14px]"
                      disabled={isRequesting}
                      onChange={(e) => {
                        setFormState((prevState) => ({
                          ...prevState,
                          password: e.target.value,
                        }));
                        // Reset error message
                        setErrors((prevState) => ({
                          ...prevState,
                          password: "",
                        }));
                      }}
                    />

                    <Label
                      className={`text-red-500 text-xs my-2 ${
                        errors.password ? "block" : "hidden"
                      }`}
                    >
                      {errors?.password}
                    </Label>
                  </div>

                  <Button
                    variant="outline"
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white w-full mt-2 h-11 cursor-pointer"
                    disabled={isRequesting}
                  >
                    Sign Up
                  </Button>
                </form>
              </section>
            </div>
          <ToastContainer className="text-base" />
          </main>
        </>
    </>
  );
};

export default SignupPage;
