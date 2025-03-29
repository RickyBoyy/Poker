import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import RegisterPage from "./pages/Register";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
