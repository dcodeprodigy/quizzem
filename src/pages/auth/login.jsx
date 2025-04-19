import React, {useState} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Slider from "../../components/slider";
import { ToastContainer, toast, Flip } from "react-toastify";
import axios from "axios"

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



const LoginPage = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  const triggerLogin = async (e) => {
    e.preventDefault();
    let toastId;
  
    try {
      setIsLoading(true);
      toastId = displayLoadingToast("Logging you in...");
  
      const response = await axios.post("http://127.0.0.1:5000/api/auth/login", {
        email: formState.email,
        password: formState.password,
      });
  
      toastId = toast.update(toastId, {
        render: "Login Success! Redirecting...",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
  
      localStorage.setItem("token", response.data.token);
      await new Promise (resolve => setTimeout(resolve, 2500));
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      const response = error.response.data;
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
      } else {
        // Toast Notification
        toastId = toast.update(toastId, {
          render: response.msg,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }
  };




  return (
    <>
      <Tags />
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
                <Link to="/Signup">Signup</Link>
              </Button>
            </div>

            <form className="my-5" onSubmit={triggerLogin}>
              <div className="mb-5">
                <h1 className="font-bold text-3xl text-black">Welcome Back!</h1>
                <p className="my-2">Login to your Quizzem account</p>
              </div>

              <div>
                <label htmlFor="email" className="font-medium mt-2">
                  Email Address
                </label>

                <Input
                  placeholder="youremail@example.com"
                  name="email"
                  type="email"
                  className="mb-4 mt-2 h-11 text-[14px]"
                  disabled={isLoading}
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
                  className={`text-red-500 text-xs mt-2 ${
                    errors.email ? "block" : "hidden"
                  }`}
                >
                  {errors?.email}
                </Label>

                <label htmlFor="pwd" className="font-medium mt-1">
                  Enter Password
                </label>
                <Input
                  placeholder="••••••••••••"
                  type="password"
                  name="pwd"
                  className="mb-4 mt-2 h-11 text-[14px]"
                  disabled={isLoading}
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
                  className={`text-red-500 text-xs mt-2 ${
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
              >
                Login
              </Button>
            </form>
          </section>
        </div>
      </main>
      <ToastContainer/>
    </>
  );
};

export default LoginPage;
