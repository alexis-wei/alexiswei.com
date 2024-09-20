import React from "react";
import { Stack, Title, Text, Group, Box, rem, Image } from "@mantine/core";
import ProjectRoot from "@/components/portfolio/ProjectRoot";
import { VideoProps } from "./types";

const HeaderComponent: React.FC = () => {
  return (
    <Group align="center" w="full" h="100%" justify="center" grow={true}>
      <Image
        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-logo.png"
        w="80px"
        h="auto"
        alt="the drop logo"
      />
    </Group>
  );
};

const VideoComponent: React.FC<VideoProps> = ({ uri, caption }) => {
  return (
    <Stack align="center">
      <div
        style={{
          width: "240px",
          height: "444px",
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
      </div>
      <Text size="sm" fw={500} style={{ letterSpacing: rem(-1) }}>
        {caption}
      </Text>
    </Stack>
  );
};

const DropContent = () => {
  return (
    <Stack py={rem(40)}>
      <Title order={3}>example pages</Title>
      <Group gap="36" justify="center">
        <VideoComponent
          uri="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-home.mp4"
          caption="home page"
        />
        <VideoComponent
          uri="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-store.mp4"
          caption="storefront"
        />
        <VideoComponent
          uri="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/thedrop-discover.mp4"
          caption="discover"
        />
      </Group>
    </Stack>
  );
};

const TheDrop: React.FC = () => {
  return (
    <Stack>
      <ProjectRoot
        title="the drop"
        time="jan-mar 2024"
        projectType="mobile web app"
        oneLiner="if etsy and shopify had a baby"
        description="Sellers of one of a kind goods want to have an easy way to directly upload their products. 
        The Drop focuses on sellers that have a following already on instagram and tiktok, and utilizes their content to create a shoppable video based feed?"
        details="onboarded 20+ shops in 2 months, made over 20k in sales volume.

while considering the primary entry point of Instagram, what is the best in-app browser experience for our users?"
        primaryColors={["#121212", "#FFFFFF", "#FFD218"]}
        primaryDesc="neutral fitting for each seller, with a pop of yellow for vibrancy. As the app onboarded more and more sellers, we realized a need for the clothes to be the center of attention, rather than our own primary colors"
        secondaryColors={[
          "#002199",
          "#FF8A22",
          "#FA1813",
          "#389910",
          "#D9D9D9",
          "#FFD218",
        ]}
        secondaryDesc="the platform primarily targets vintage sellers, think hippie, fun, funky pops of colors"
        fonts={[
          { name: "instrument serif", style: "regular" },
          {
            name: "instrument sans",
            style: "semibold",
            imgUri:
              "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/instrument-sans.jpg",
          },
        ]}
        fontDesc="a pairing to mimic the feeling of a fashion magazine"
        header={<HeaderComponent />}
        content={<DropContent />}
      />
    </Stack>
  );
};

export default TheDrop;
