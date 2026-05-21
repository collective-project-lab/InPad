import { useState } from "react";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/notes");
      const token = await auth.currentUser.getIdToken();
      console.log(token);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    try {
      await signInAnonymously(auth);
      navigate("/notes");
      const token = await auth.currentUser.getIdToken();
      console.log(token);
    } catch (err) {
      setError("Failed to login as guest");
    }
  };

  

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        No account? <Link to="/signup">Sign up</Link>
      </p>
      <button type="button" onClick={handleGuestLogin} style={{ marginTop: "10px" }}>
        Continue as Guest
      </button>
    </div>
  );
};

export default Login;
