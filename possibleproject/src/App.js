import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import RegisterPage from "./pages/Register";
import LoginPage from "./pages/Login";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
