/**
 * A nice, reusable function for displaying toasts
 */
import { toast, Flip } from "react-toastify";
// import toast, { Toaster } from 'react-hot-toast';

/**
 *
 * @param {string} msg - The message to be displayed
 * @param {toastId} toastId - Identifies a toast for future updates. Returned when display() is called
 * @param {string} status - 'success' or 'error'. Set when trying to upload already existing loading toast
 * @function This does not use an arrow function because that does will not have the arguments variable
 */
export const LoadingToast = function (msg, toastId, status) {
    /**
     * 
     * @returns {Id} The toast Id
     */
  const display = () => {
    // Run this to show a loading toast. Returns the toast Id
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
  };

  const update = () => {
    return toast.update(toastId, {
      render: msg,
      type: status,
      isLoading: false,
      autoClose: 5000,
    });
  };

  console.log(arguments.length)
  if (arguments.length === 1) {
    /**
     * @returns {Id} Toast Id
     */
    return display(); // Returns the toastId here
  } else if (arguments.length === 3) {
    update();
  } else {
    console.error("Invalid number of args for loading toast");
    return;
  }
};


/**
 * 
 * @param {string} msg - The success message to be displayed 
 * @returns - toast Id
 */
export const SuccessToast = (msg) => {
  return toast.success(msg, {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
};

/**
 * 
 * @param {string} msg - The error message to be displayed 
 * @returns toast Id
 */
export const ErrorToast = (msg) => {
  return toast.error(msg, {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
};

export const InfoToast = (msg) => {
  return toast.info(msg, {
    position: "bottom-center",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Flip,
  });
};
