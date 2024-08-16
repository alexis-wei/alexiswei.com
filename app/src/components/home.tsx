"use client";
import { Box, Button, Group, Stack, Text, Title, rem } from "@mantine/core";
import BasilTwitterSolid from "~icons/basil/twitter-solid.jsx";
import HeroiconsEnvelope from "~icons/heroicons/envelope";

import classes from "./page.module.css";

export default function Home() {
  return (
    <Stack justify="space-between" h="100vh">
      <Box p={36} c="dark.7">
        <Stack gap={0}>
          <Group gap={4}>
            <Text fw={500} size="lg" style={{ letterSpacing: rem(-1) }}>
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
          <Text fw={500} size="lg" style={{ letterSpacing: rem(-1) }}>
            a design engineer currently exploring:
          </Text>
          <Group gap={8} pt={8} style={{ maxWidth: rem(240) }}>
            <Button
              className={`${classes.button} ${classes.ar}`}
              variant="outline">
              ar/vr
            </Button>
            <Button
              className={`${classes.button} ${classes.game}`}
              variant="outline">
              games
            </Button>
            <Button
              className={`${classes.button} ${classes.immerse}`}
              variant="outline">
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
