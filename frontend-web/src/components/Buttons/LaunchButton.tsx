import { Button } from "@mui/material";
import React from "react";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Link } from "react-router-dom";

const LaunchButton = ({ sx = {}, ...props }) => {
  return (
    <Button variant="contained" sx={{ borderRadius: 4, ...sx,color:"white" }} {...props}>
      <Link to="/play" style={{ color: "white", textDecoration: "none" }}>Play Now</Link>
      <KeyboardArrowRightIcon />
    </Button>
  );
};

export default LaunchButton;
