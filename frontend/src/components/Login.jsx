import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "react-toastify";     // ✅ Corrected here
import "react-toastify/dist/ReactToastify.css"; // ✅ make sure it's imported once in your app (if not already)
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const user = useSelector((store) => store.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    if (isReset) {
      setResetEmail(value);
    } else {
      setInput({ ...input, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReset) {
      if (!resetEmail) return toast.error("Enter email to reset password.");
      toast.success("Password reset link sent!");
      return setIsReset(false);
    }

    if (isSignUp) {
      if (!input.username || !input.email || !input.password) {
        return toast.error("Fill all fields to register");
      }
      try {
        setLoading(true);
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1/user/register`,
          input,
          { withCredentials: true }
        );
        toast.success("Registered successfully. Please login.");
        setIsSignUp(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Sign up failed");
      } finally {
        setLoading(false);
      }
    } else {
      if (!input.email || !input.password) {
        return toast.error("Enter email and password");
      }
      try {
        setLoading(true);
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1/user/login`,
          { email: input.email, password: input.password },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message || "Logged in successfully");
        navigate("/");
        setInput({ email: "", password: "", username: "" });
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  return (
   <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
    <div className="bg-gray-800 px-10 py-8 rounded-3xl w-full max-w-md">
      <h1 className="text-3xl font-semibold mb-4 text-center">
        {isSignUp ? "Sign Up" : isReset ? "Reset Password" : "Welcome Back"}
      </h1>
      <p className="text-sm text-gray-400 mb-6 text-center">
        {isSignUp
          ? "Create a new account"
          : isReset
          ? "Enter your email to reset password"
          : "Login to see photos & videos from your friends"}
      </p>

      {/* Username Field */}
      {isSignUp && (
        <div className="mb-4">
          <label className="block mb-1">Username</label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            placeholder="Your username"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus-visible:ring-transparent"
          />
        </div>
      )}

      {/* Email Field */}
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <Input
          type="email"
          name="email"
          value={isReset ? resetEmail : input.email}
          onChange={changeEventHandler}
          placeholder="Your email"
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus-visible:ring-transparent"
        />
      </div>

      {/* Password Field */}
      {!isReset && (
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Password"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus-visible:ring-transparent"
          />
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {loading ? (
          <Button disabled className="bg-orange-500 py-2 rounded font-semibold">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-orange-500 py-2 rounded text-white font-semibold"
          >
            {isReset ? "Send Reset Link" : isSignUp ? "Sign Up" : "Login"}
          </Button>
        )}

        {/* Forgot password */}
        {isReset ? (
          <button
            type="button"
            onClick={() => setIsReset(false)}
            className="text-orange-400 text-sm underline"
          >
            Back to Login
          </button>
        ) : (
          !isSignUp && (
            <button
              type="button"
              onClick={() => setIsReset(true)}
              className="text-sm text-orange-400 underline"
            >
              Forgot password?
            </button>
          )
        )}
      </form>

      {/* Switch between login / signup */}
      <div className="mt-6 text-center text-sm">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setIsReset(false);
          }}
          className="text-orange-400 underline ml-1"
        >
          {isSignUp ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  </div>
  );
};

export default Login;
