import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const Slider = () => {
  return (
    <>
      <Swiper pagination={{ dynamicBullets: true }} modules={[Pagination]}>
        <SwiperSlide>
          <div className="flex items-center justify-center flex-col">
            <img
              src="/images/illustration-1.png"
              alt="Test"
              className="w-[90%]"
            />
            <div className="-mt-3 mb-26 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-medium text-black  mb-2">
                Boost Your Learning
              </h2>
              <p className="text-center">
                with AI-powered quizzes tailored to your exact study material
                and track your progress effortlessly
              </p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-center justify-center flex-col">
            <img
              src="/images/illustration-2.png"
              alt="Test"
              className="w-[90%] rounded-full"
            />
            <div className="-mb-3 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-medium text-black mb-2">
                Smart Quiz Retakes
              </h2>
              <p className="text-center">
                Struggling with tough questions? Retake only the ones you got
                wrong and improve faster!
              </p>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="flex items-center justify-center flex-col">
            <img
              src="/images/illustration-3.png"
              alt="Test"
              className="w-[90%]"
            />
            <div className="-mt-3 mb-26 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-medium text-black  mb-2">
                Create Quizzes in Seconds
              </h2>
              <p className="text-center">
                Upload your study material, fine-tune the quiz settings, and let
                AI generate the perfect test for you
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </>
  );
};

export default Slider 
