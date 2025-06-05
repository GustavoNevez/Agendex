import React from "react";
import { createRoot } from "react-dom/client";
import LandingPage from "./LandingPage";
import "../index.css"; // ou o CSS global do seu projeto

const container = document.getElementById("landing-root");
if (container) {
  createRoot(container).render(<LandingPage />);
}
