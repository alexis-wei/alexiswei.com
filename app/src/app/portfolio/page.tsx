"use client";
import React, { useCallback } from "react";
import { Box, Stack, Title, Text, Button, rem } from "@mantine/core";
import TheDrop from "./TheDrop";
import Phoenix from "./Phoenix";
import Space from "./Space";

const ProjectButton: React.FC<{ title: string; id: string }> = ({
  title,
  id,
}) => {
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
    <Button variant="transparent" m="0" p="0" onClick={handleClick}>
      <Text c="#1f1f1f">{title}</Text>
    </Button>
  );
};

export default function Portfolio() {
  return (
    <Stack pb={20} align="center">
      <Stack gap={80} pb={200} w="100%">
        <Stack
          w="full"
          justify="center"
          align="center"
          h="100vh"
          style={{ color: "#1f1f1f" }}>
          <Title order={4}>Table of contents</Title>
          <Stack align="start" gap={0}>
            <ProjectButton title="01 // space" id="space" />
            <ProjectButton title="02 // the drop" id="thedrop" />
            <ProjectButton title="03 // phoenix" id="phoenix" />
          </Stack>
        </Stack>
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
    </Stack>
  );
}
