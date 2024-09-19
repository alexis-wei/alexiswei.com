import React from "react";
import { Box, Group, Image, Stack, Text, Title, rem } from "@mantine/core";

export interface Font {
  name: string;
  style: string;
  imgUri?: string;
}

interface ProjectRootProps {
  title?: string;
  oneLiner?: string;
  description?: string;
  details: string;
  primaryColors?: string[];
  primaryDesc: string;
  secondaryColors?: string[];
  secondaryDesc: string;
  time?: string;
  projectType?: string;
  fonts: Font[];
  fontDesc: string;
}

const ProjectRoot: React.FC<ProjectRootProps> = ({
  title = "title",
  oneLiner = "this is a one liner",
  description = "this is description",
  ...props
}) => {
  return (
    <Stack p={20} gap={rem(20)} mih="100vh">
      <Box
        bd="0.5px solid rgba(0, 0, 0, 0.2)"
        w="100%"
        h={400}
        style={{ "border-radius": "16px" }}></Box>
      <Group justify="space-between" align="start">
        <Group gap={20} align="start" w="full">
          <Title order={3} w={{ base: "100%", md: rem(280) }}>
            &quot;{title}&quot;
          </Title>
          <Text w={{ base: "100%", md: rem(280) }} mt={rem(-4)}>
            {oneLiner}
          </Text>
          <Text w={{ base: "100%", md: rem(280) }} mt={rem(-4)}>
            {description}
          </Text>
          <Text w={{ base: "100%", md: rem(280) }} mt={rem(-4)}>
            {props.details}
          </Text>
        </Group>
        <Stack w={rem(200)} align="end" gap={rem(4)}>
          <Text>{props.time}</Text>
          <Text>{props.projectType}</Text>
        </Stack>
      </Group>
      <Stack>
        <Title order={3}>design system</Title>
        <Group gap={36} align="start">
          <Stack>
            <Text size="md">Primary</Text>
            <Group align="start" gap={8}>
              <Stack gap={10} w={rem(80)}>
                {props.primaryColors?.map((color, index) => (
                  <Box key={index} h={40} bg={color} />
                ))}
              </Stack>
              <Text w={rem(240)} mt={rem(-6)}>
                {props.primaryDesc}
              </Text>
            </Group>
          </Stack>
          <Stack>
            <Text size="md">Secondary</Text>
            <Group align="start" gap={8}>
              <Group gap={10} wrap="wrap" w={rem(180)} mih={rem(136)}>
                {props.secondaryColors?.map((color, index) => (
                  <Box key={index} h={40} bg={color} w={rem(80)} />
                ))}
              </Group>
              <Text w={rem(240)} mt={rem(-6)}>
                {props.secondaryDesc}
              </Text>
            </Group>
          </Stack>
          <Stack>
            <Text size="md">Fonts</Text>
            <Group>
              {props.fonts?.map((font, index) => (
                <Stack gap={4} key={index}>
                  <Image
                    src={
                      font.imgUri ??
                      "https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/defaultFont.jpg"
                    }
                    alt="font"
                    w={rem(100)}
                    h={rem(100)}
                  />
                  <Stack gap={0}>
                    <Text c="1F1F1F">{font.name}</Text>
                    <Text c="#9B9B9B">{font.style}</Text>
                  </Stack>
                </Stack>
              ))}
            </Group>
          </Stack>
        </Group>
      </Stack>
    </Stack>
  );
};

export default ProjectRoot;
