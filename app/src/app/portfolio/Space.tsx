import React from "react";
import { Stack, Title, Text, Group, Box, rem, Image } from "@mantine/core";
import ProjectRoot from "@/components/portfolio/ProjectRoot";

const HeaderComponent: React.FC = () => {
  return (
    <Group
      align="center"
      w="full"
      h="100%"
      justify="center"
      grow={true}
      bg="black">
      <Image
        src="https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/space-dark.png"
        h="auto"
        w="300px"
        alt="space logo"
      />
    </Group>
  );
};

const Space: React.FC = () => {
  return (
    <Stack>
      <ProjectRoot
        title="space"
        time="present"
        projectType="visionOS"
        oneLiner="an immersive VR meditation experience–for yourself and with friends"
        description="the name 'space' comes from wanting users to having their own space to focus on themselves. A place that you choose to be in, with intention"
        details="the design is inspired by the galaxy, a place where you can get lost in, staring at the vast sky, an endless number of possibilities to focus on, an inspiring world to be in"
        primaryColors={["#000000", "#B6DCFF", "#EED1ED"]}
        primaryDesc="we start with the key colors of the sky, throughout both night and day, the biggest space that most of us find ourselves getting lost in"
        secondaryColors={["#CFECCE", "#FFE5A7", "#639817", "#FC7812"]}
        secondaryDesc="the secondary colors contrast the light pastels in the primaries by being bright pops of color that reminds us of elements of nature. The bright green from leaves and a glowing orange for a warm day under the sun, as if you can already imagine laying on the grass at a beautiful park"
        fonts={[
          {
            name: "bagel hot one",
            style: "regular",
            imgUri:
              "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/bagel.jpg",
          },
          {
            name: "cutive mono",
            style: "regular",
            imgUri:
              "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/cutivemono.jpg",
          },
        ]}
        fontDesc="thick title font for a safe pillowy comfort feeling, matched with the classic school styles of a calm mono form"
        header={<HeaderComponent />}
      />
    </Stack>
  );
};

export default Space;
