"use client";
import { Box, Stack, Text, rem } from "@mantine/core";
import Saturn from "./Saturn";

export default function Welcome() {
  return (
    <Stack h="100dvh" w="100dvw" justify="center" align="center">
      <Saturn />
      <Text ff="heading" fw="700" style={{ letterSpacing: rem(-1) }}>
        Welcome
      </Text>
    </Stack>
  );
}
