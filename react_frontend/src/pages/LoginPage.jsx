import React from "react";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import Logo from "colored-logo.png"; // Ensure you have a logo image in the specified path

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-300 to-purple-100">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-xl bg-white bg-opacity-60 backdrop-blur-md flex flex-col items-center">
        <img src={Logo} alt="Setu Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-purple-800 mb-1">Log In</h1>
        <p className="text-gray-600 mb-6">to your account</p>
        <form className="w-full flex flex-col gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaEnvelope />
            </span>
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white bg-opacity-80"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FaLock />
            </span>
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white bg-opacity-80"
            />
          </div>
          <div className="flex justify-end text-xs text-purple-700 mb-2 cursor-pointer hover:underline">
            Forgot Password?
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-purple-700 text-white font-semibold text-lg shadow-md hover:bg-purple-800 transition"
          >
            Log In
          </button>
        </form>
        <div className="my-4 flex items-center w-full">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <button className="flex items-center gap-2 w-full justify-center py-2 rounded-full border border-gray-300 bg-white bg-opacity-90 hover:bg-gray-100 transition mb-2">
          <FaGoogle className="text-lg text-red-500" />
          <span className="font-medium text-gray-700">Google</span>
        </button>
        <div className="mt-2 text-sm text-gray-700">
          Don't have an Account?{' '}
          <span className="text-purple-700 font-semibold cursor-pointer hover:underline">Sign Up</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
