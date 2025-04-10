import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Slider from "../../components/slider"


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

const LoginPage = () => {
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

            <form className="my-5">
              <div className="mb-5">
                <h1 className="font-bold text-3xl text-black">
                  Welcome Back!
                </h1>
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
                />

                <label htmlFor="pwd" className="font-medium mt-1">
                  Enter Password
                </label>
                <Input
                  placeholder="••••••••••••"
                  type="password"
                  name="pwd"
                  className="mb-4 mt-2 h-11 text-[14px]"
                />

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
    </>
  );
};

export default LoginPage;
