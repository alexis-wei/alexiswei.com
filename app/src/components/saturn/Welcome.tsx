"use client";
import { Button, Stack, Text, Transition, rem } from "@mantine/core";
import Saturn from "./Saturn";
import { useState } from "react";
import classes from "./page.module.css";

export default function Welcome() {
  const [visible, setVisible] = useState(true);

  const handleEnter = () => {
    setVisible(false);
  };

  return (
    <Transition
      mounted={visible}
      transition="fade"
      duration={1000}
      timingFunction="ease">
      {(styles) => (
        <div style={styles}>
          <Stack
            h="100dvh"
            w="100dvw"
            justify="center"
            py={rem(240)}
            align="center"
            bg="white"
            gap={rem(100)}
            style={{ position: "absolute" }}>
            <Stack align="center" justify="center">
              <Saturn />
              <Text ff="heading" fw="700" style={{ letterSpacing: rem(-1) }}>
                welcome
              </Text>
            </Stack>
            <Button
              size="xs"
              variant="transparent"
              color="dark.7"
              onClick={handleEnter}
              style={{ minHeight: rem(40), left: rem(-4) }}
              className={classes.enter}>
              &#187; &nbsp; enter alexis&apos; world
            </Button>
          </Stack>
        </div>
      )}
    </Transition>
  );
}
