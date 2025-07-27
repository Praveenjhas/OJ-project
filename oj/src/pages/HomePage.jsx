// src/pages/HomePage.jsx
import React from "react";
import Navbar from "../components/Navbar.jsx";
import HeroSection from "../components/HeroSection.jsx";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  );
}

export default HomePage;
