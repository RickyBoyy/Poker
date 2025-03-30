import React, { useState } from "react";
import "../App.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="register">
      <div className="card_register">
        <div className="register_title">
          <h1 className="register_name_title">Poker Up!</h1>
        </div>
        <div className="user_interaction_register">
          <div className="textfield_register_username">
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
          <div className="textfield_register_password">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
