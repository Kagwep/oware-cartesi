import { Box } from "@mui/material";
import React from "react";
import Footer from "../components/Footers/MainFooter";
import Navbar from "../components/Navbars/MainNavbar";
import Section1 from "../containers/Section1";
import Section2 from "../containers/Section2";

const Home = () => {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Sections */}
      <Section1 />
      <Section2 />
      
      <Box sx={{ bgcolor: "background.default", position: "relative" }}>
        <Footer />
      </Box>
    </div>
  );
};

export default Home;