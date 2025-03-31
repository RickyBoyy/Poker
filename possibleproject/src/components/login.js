import React, { useState } from "react";
import "../App.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="login">
      <div className="card_login">
        <div className="login_title">
          <h1 className="login_name_title">Poker Up!</h1>
        </div>
        <div className="user_interaction_login">
          <div className="textfield_login_username">
            <label htmlFor="Username">Username</label>
            <input
              type="text"
              name="Username"
              placeholder="Username"
              maxLength="12"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="textfield_login_password">
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              name="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="reference_signin">
            <p>If you already have an account,</p>
            <a onClick={redirectToLogin} style={{ cursor: "pointer" }}>
              login.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
