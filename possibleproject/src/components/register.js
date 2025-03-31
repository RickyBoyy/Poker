import React, { useState } from "react";
import "../App.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="Login">
      <div className="login_credentials">
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
      </div>
    </div>
  );
};

export default Register;
