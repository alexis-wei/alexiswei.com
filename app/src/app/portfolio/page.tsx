"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Stack, Title, Text, Button, rem } from "@mantine/core";
import TheDrop from "./TheDrop";
import Phoenix from "./Phoenix";
import Space from "./Space";
import classes from "./portfolio.module.css";
import Foreword from "./Foreword";

interface ProjectButtonProps {
  title: string;
  id: string;
}

const ProjectButton: React.FC<ProjectButtonProps> = ({ title, id }) => {
  const handleClick = useCallback(() => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      setTimeout(() => {
        window.scrollTo({
          top: element.offsetTop,
          behavior: "auto",
        });
      }, 800);
    }
  }, [id]);

  return (
    <Button
      variant="transparent"
      m="0"
      p="0"
      onClick={handleClick}
      className={classes.projectButton}>
      <Text c="#1f1f1f">{title}</Text>
    </Button>
  );
};

export default function Portfolio() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const buttons: ProjectButtonProps[] = [
    { title: "00 // foreword", id: "foreword" },
    { title: "01 // space", id: "space" },
    { title: "02 // the drop", id: "thedrop" },
    { title: "03 // phoenix", id: "phoenix" },
  ];
  return (
    <Stack pb={20} align="center">
      <Stack gap={80} pb={200} w="100%" h="100%">
        <Stack
          w="full"
          justify="center"
          align="center"
          h="100vh"
          style={{ color: "#1f1f1f" }}>
          <Title order={4}>table of contents</Title>
          <Stack align="start" gap={0}>
            {buttons.map((button) => (
              <ProjectButton
                key={button.id}
                title={button.title}
                id={button.id}
              />
            ))}
          </Stack>
        </Stack>
        <Box id="foreword">
          <Foreword />
        </Box>
        <Box id="space">
          <Space />
        </Box>
        <Box id="thedrop">
          <TheDrop />
        </Box>
        <Box id="phoenix">
          <Phoenix />
        </Box>
      </Stack>
      <Text size="xs">with love, alexis</Text>
      <Button
        variant="transparent"
        pos="fixed"
        radius={"xl"}
        bg={"rgba(255,255,255,0.62"}
        c="#1F1F1F"
        size="compact-sm"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "24px",
          display: showScrollTop ? "block" : "none",
        }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={classes.scrollTopButton}>
        ↑ top
      </Button>
    </Stack>
  );
}
