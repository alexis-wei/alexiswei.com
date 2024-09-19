import React from "react";
import ProjectRoot from "@/components/portfolio/ProjectRoot";
import { Box, Stack, Title, Text, Button, rem } from "@mantine/core";

export default function Portfolio() {
  return (
    <div>
      <ProjectRoot
        title="space"
        time="jan-mar 2024"
        projectType="mobile web app"
        details="hello this is box"
        primaryColors={["#121212", "#D9D9D9", "#FFD218"]}
        primaryDesc="neutral fitting for each seller, but the key yellow for vibrancy"
        secondaryColors={[
          "#121212",
          "#D9D9D9",
          "#FFD218",
          "#121212",
          "#D9D9D9",
          "#FFD218",
        ]}
        secondaryDesc="this is why these additional colors are chosen"
        fonts={[
          { name: "instrument serif", style: "regular" },
          { name: "instrument sans", style: "regular" },
        ]}
        fontDesc="this is why the font is used"
      />
      <ProjectRoot
        title="the drop"
        time="jan-mar 2024"
        projectType="mobile web app"
        details="hello this is box"
        primaryColors={["#121212", "#D9D9D9", "#FFD218"]}
        primaryDesc="neutral fitting for each seller, but the key yellow for vibrancy"
        secondaryColors={[
          "#002199",
          "#FF8A22",
          "#FA1813",
          "#389910",
          "#D9D9D9",
          "#FFD218",
        ]}
        secondaryDesc="this is why these additional colors are chosen"
        fonts={[
          { name: "instrument serif", style: "regular" },
          { name: "instrument sans", style: "semibold" },
        ]}
        fontDesc="this is why the font is used"
      />
      <ProjectRoot
        title="pheonix"
        time="jan-mar 2024"
        projectType="mobile web app"
        details="hello this is box"
        primaryColors={["#FF5C29", "#81E70D", "#FAFAFA"]}
        primaryDesc="neutral fitting for each seller, but the key yellow for vibrancy"
        secondaryColors={[
          "#D2F8BE",
          "#FFFCB7",
          "#C6CEF9",
          "#FFD5B7",
          "#F1C6F9",
          "#FFCECE",
        ]}
        secondaryDesc="this is why these additional colors are chosen"
        fonts={[
          { name: "archivo", style: "black expanded" },
          { name: "archivo", style: "regular" },
        ]}
        fontDesc="this is why the font is used"
      />
      <Stack
        w="full"
        justify="center"
        align="center"
        h="100vh"
        style={{ color: "#1f1f1f" }}>
        <Title order={4}>Table of contents</Title>
        <Stack gap="0">
          <Text c="#1f1f1f" fw={600}>
            Projects
          </Text>
          <Stack align="start" pl={rem(8)} gap={0}>
            <Button variant="transparent" m="0" p="0">
              <Text c="#1f1f1f">space</Text>
            </Button>
            <Button variant="transparent" m="0" p="0">
              <Text c="#1f1f1f">the drop</Text>
            </Button>
            <Button variant="transparent" m="0" p="0">
              <Text c="#1f1f1f">pheonix</Text>
            </Button>
          </Stack>
          <Button variant="transparent" m="0" p="0">
            <Text c="#1f1f1f" fw={600}>
              About me
            </Text>
          </Button>
        </Stack>
      </Stack>
    </div>
  );
}
