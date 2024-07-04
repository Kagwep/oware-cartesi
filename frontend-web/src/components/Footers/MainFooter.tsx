import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import { footerContent } from "../../utils/content";
import OutlinedButton from "../Buttons/OutlinedButton";
import Title from "../Title";

const {
  subscribe,
  copyright,
} = footerContent;

const LinkSection = ({ title, links }) => (
  <Stack spacing={2.5}>
    <Title>{title}</Title>

    {links.map(({ title }) => (
      <Typography
        key={title}
        variant="body2"
        color="text.secondary"
        sx={{
          cursor: "pointer",
          "&:hover": {
            color: "text.primary",
          },
        }}
      >
        {title}
      </Typography>
    ))}
  </Stack>
);

const Footer = () => {
  return (
    <Box>
      <Divider sx={{ mb: 10 }} />

      <Container>
        <Grid container spacing={8} flexWrap="wrap-reverse">

                    {/* Subscribe */}
          <Grid item xs={12} md={6} lg={5} xl={4}>
            <Stack>
              <Title sx={{ mb: 1 }}>{subscribe.title}</Title>

              <Typography variant="body2" color="text.secondary">
                {subscribe.subtitle}
              </Typography>

              <OutlinedButton arrow sx={{ height: 60, my: 3 }}>
                Subscribe
              </OutlinedButton>
            </Stack>
          </Grid>
          
          {/* Links */}


        </Grid>

        <Divider sx={{ mt: 6, mb: 5 }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ pb: 6 }}
        >
          <Typography variant="body2" color="text.secondary">
            {copyright.left}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {copyright.center}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {copyright.right}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
