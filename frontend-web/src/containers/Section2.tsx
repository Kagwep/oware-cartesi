import { Container, Stack, Typography } from "@mui/material";
import React from "react";
import CountUp from "react-countup";
import Title from "../components/Title";
import { section2Content } from "../utils/content";

interface CounterProps {
  before?: string;
  after?: string;
  counter: number;
  subtitle: string;
  decimals?: number; // Change boolean to number
}

const { items } = section2Content;

const CustomCounter: React.FC<CounterProps> = ({
  before = "",
  after = "",
  counter,
  subtitle,
  decimals = 0, // Default to 0 if not provided
}) => (
  <Stack spacing={{ xs: 1, md: 2 }} alignItems="center">
    <CountUp prefix={before} suffix={after} end={counter} decimals={decimals}>
      {({ countUpRef }) => (
        <Title variant="h4" sx={{ fontWeight: 400 }}> {/* Change variant value */}
          <span ref={countUpRef} />
        </Title>
      )}
    </CountUp>

    <Typography variant="body2" color="text.secondary">
      {subtitle}
    </Typography>
  </Stack>
);

const Section2: React.FC = () => {
  return (
    <Container sx={{ mt: -10 }}>

    </Container>
  );
};

export default Section2;
