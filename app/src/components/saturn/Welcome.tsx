"use client";
import { Button, Stack, Text, rem } from "@mantine/core";
import Saturn from "./Saturn";

export default function Welcome() {
  return (
    <Stack
      h="100dvh"
      w="100dvw"
      justify="center"
      py={rem(240)}
      align="center"
      bg="white"
      gap={rem(120)}
      style={{ position: "absolute" }}>
      <Stack align="center">
        <Saturn />
        <Text ff="heading" fw="700" style={{ letterSpacing: rem(-1) }}>
          Welcome
        </Text>
      </Stack>
      <Button
        radius={"xl"}
        size="sm"
        fw="600"
        variant="outline"
        color="dark.7"
        onClick={() => {}}>
        enter &quot;world&quot;
      </Button>
    </Stack>
  );
}
