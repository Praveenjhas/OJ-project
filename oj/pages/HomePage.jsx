// src/pages/HomePage.jsx
import React from "react";
import Navbar from "../src/components/Navbar.jsx";
import HeroSection from "../src/components/HeroSection.jsx";
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
