import React from "react";
import { Stack, Title, Text, Group, Box, rem, Image } from "@mantine/core";
import ProjectRoot from "@/components/portfolio/ProjectRoot";
import { VideoProps } from "./types";

const HeaderComponent: React.FC = () => {
  return (
    <Group
      align="center"
      w="full"
      h="100%"
      justify="center"
      grow={true}
      bg="#1F1F1F">
      <Image
        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/phoenix-logo.png"
        w="160px"
        h="auto"
        alt="the drop logo"
      />
    </Group>
  );
};

const VideoComponent: React.FC<VideoProps> = ({ uri, caption }) => {
  return (
    <Stack align="center">
      <Box
        w={{ base: "80%", sm: "600px", md: "800px" }}
        h="auto"
        style={{
          borderRadius: "16px",
          outline: "1px solid #333333",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
        }}>
        <video
          src={uri}
          muted={true}
          autoPlay={true}
          loop={true}
          playsInline={true}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
      <Text size="sm" fw={500} style={{ letterSpacing: rem(-1) }}>
        {caption}
      </Text>
    </Stack>
  );
};

const PhoenixContent = () => {
  return (
    <Stack py={rem(40)}>
      <Title order={3}>example pages</Title>
      <Text size="xs">*data empty for client privacy</Text>
      <Group gap="36" justify="center">
        <VideoComponent
          uri="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/phoenix.mp4"
          caption="survey product summary"
        />
      </Group>
    </Stack>
  );
};

const Phoenix: React.FC = () => {
  return (
    <Stack>
      <ProjectRoot
        title="phoenix"
        time="april/may 2024"
        projectType="mobile web app"
        oneLiner="a co-creation platform for D2C brands  to partner with their community to build, test, & launch products "
        description="Phoenix was born directly from a need of brands wanting to hear directly from their most loyal customers.
        Brands have access to thousands people eager to provide answers, yet they struggle to find meaning out of the data.
        The goal of Phoenix is to summarize these community finding into concrete suggestions"
        details="design inspiration came from friendly fun colors made to engage a younger community. Turn surveys to fun"
        primaryColors={["#FF5C29", "#81E70D", "#FAFAFA"]}
        primaryDesc="emotions: energetic, youthful"
        secondaryColors={[
          "#D2F8BE",
          "#FFFCB7",
          "#C6CEF9",
          "#FFD5B7",
          "#F1C6F9",
          "#FFCECE",
        ]}
        secondaryDesc="pastel fresh colors are used for energizing for a generally younger gen-z and gen-alpha audience that we expect to get feedback from for our platform"
        fonts={[
          {
            name: "archivo",
            style: "black expanded",
            imgUri:
              "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/archivo-expanded.jpg",
          },
          {
            name: "archivo",
            style: "regular",
            imgUri:
              "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/archivo-reg.jpg",
          },
        ]}
        fontDesc="As the colors are full and varied, a same font different weight pairing provides uniformity while still being able to stand out"
        header={<HeaderComponent />}
        content={<PhoenixContent />}
      />
    </Stack>
  );
};

export default Phoenix;
