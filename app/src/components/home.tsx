"use client";
import { Box, Button, Group, Stack, Text, Title, rem } from "@mantine/core";
import BasilTwitterSolid from "~icons/basil/twitter-solid";
import HeroiconsEnvelope from "~icons/heroicons/envelope-20-solid";
import MovingGradient from "./MovingGradient";

import classes from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [color, setColor] = useState("#ffffff");

  const changeColor = (colorNum: number) => {
    if (colorNum === 1) {
      setColor("#d0bfff");
    } else if (colorNum === 2) {
      setColor("#ffec99");
    } else if (colorNum === 3) {
      setColor("#d8f5a2");
    } else {
      setColor("#ffffff");
    }
  };

  return (
    <Stack
      justify="space-between"
      h="100dvh"
      w="100dvw"
      style={{ position: "absolute" }}>
      <MovingGradient color={color} />
      <Box p={36} c="dark.7">
        <Stack gap={0}>
          <Group gap={4}>
            <Text fw={500} size="lg" style={{ letterSpacing: rem(-0.5) }}>
              hi, i&apos;m
            </Text>
            <Title
              size="h3"
              style={{
                letterSpacing: rem(-1.8),
                textRendering: "geometricPrecision",
              }}>
              alexis
            </Title>
          </Group>
          <Text fw={500} size="lg" style={{ letterSpacing: rem(-0.5) }}>
            a design engineer currently exploring:
          </Text>
          <Group
            gap={8}
            pt={8}
            style={{ maxWidth: rem(240) }}
            onMouseLeave={() => changeColor(0)}>
            <Button
              className={`${classes.button} ${classes.ar}`}
              variant="outline"
              onMouseEnter={() => changeColor(1)}>
              ar/vr
            </Button>
            <Button
              className={`${classes.button} ${classes.game}`}
              variant="outline"
              onMouseEnter={() => changeColor(2)}>
              games
            </Button>
            <Button
              className={`${classes.button} ${classes.immerse}`}
              variant="outline"
              onMouseEnter={() => changeColor(3)}>
              immersive experiences
            </Button>
          </Group>
        </Stack>
      </Box>
      <Box p={36} c="dark.7">
        <Stack gap={8} align="flex-end">
          <Button
            className={classes.contactButton}
            variant="outline"
            onClick={() =>
              window.open("https://twitter.com/itsalexiswei", "_blank")
            }>
            <Group gap={4}>
              <span>say hi</span> <BasilTwitterSolid />
            </Group>
          </Button>
          <Button
            className={classes.contactButton}
            variant="outline"
            onClick={() =>
              window.open("mailto:alexisw.contact@gmail.com", "_blank")
            }>
            <Group gap={4}>
              <span>let&apos;s collab</span> <HeroiconsEnvelope />
            </Group>
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
