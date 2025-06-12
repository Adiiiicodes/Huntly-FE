import { useState } from "react";
import { Mail, Lock, X, LogIn  } from "lucide-react"; // Assuming you're using Lucide for icons
import styles from "./LoginButton.module.css";

export default function LoginButtonComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      // Dummy success condition – replace with real API call
      if (email === "test@example.com" && password === "password") {
        setMessage("Login successful!");
        // You can redirect or store token here
      } else {
        setMessage("Login failed. Invalid credentials.");
      }
    } catch (err) {
      setMessage("An error occurred.");
    }
  };

  return (
    <>
      <button
        className="bg-black ml-5 btn-primary"
        onClick={() => setIsOpen(true)}
      >
        Login
        <LogIn size={18} />
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.container}>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
            <h2 className={styles.title}>Welcome Back!</h2>
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} />
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} />
                <input
                  type="password"
                  placeholder="Password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm mt-2 mb-4 px-1">
                <label className="flex items-center gap-2 text-gray-300">
                  <input type="checkbox" className="accent-white" />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-blue-400 hover:underline hover:text-white transition-all"
                  onClick={() => alert("Redirect to Forgot Password flow")}
                >
                  Forgot Password?
                </button>
              </div>

             <button
  type="submit"
  className="w-full py-2 rounded-lg bg-white text-black font-semibold relative overflow-hidden z-10
             transition-all duration-300 ease-in-out
             hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] group"
>
  <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
  <span className="relative z-10">Login</span>
</button>

              {message && (
                <p className="text-sm mt-2 text-center text-red-500">{message}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
