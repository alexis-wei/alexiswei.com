import React, { ReactNode } from "react";
import { Box, Group, Image, Stack, Text, Title, rem } from "@mantine/core";

import classes from "./portfolio.module.css";

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
  header?: ReactNode;
  content?: ReactNode;
}

interface DescriptionProps {
  text: string;
}

const DescriptionText: React.FC<DescriptionProps> = ({ text }) => (
  <Text
    w={{ base: "80%", md: rem(240) }}
    style={{ letterSpacing: rem(-0.2) }}
    mt={rem(-4)}
    size="sm">
    {text}
  </Text>
);

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
        style={{ borderRadius: "16px", overflow: "clip" }}>
        {props.header}
      </Box>
      <Group
        justify="space-between"
        align="start"
        className={classes.projectRootWrapGroup}>
        <Group gap={rem(32)} align="start" w="full">
          <Title order={3} w={{ base: "100%", md: rem(240) }}>
            &quot;{title}&quot;
          </Title>
          <DescriptionText text={oneLiner} />
          <DescriptionText text={description} />
          <DescriptionText text={props.details} />
        </Group>
        <Stack
          w={{ base: "100%", md: rem(240) }}
          align="end"
          gap={0}
          mt={rem(-4)}>
          <Text size="sm" style={{ letterSpacing: rem(-0.2) }}>
            {props.time}
          </Text>
          <Text fw={600} size="sm" style={{ letterSpacing: rem(-0.2) }}>
            {props.projectType}
          </Text>
        </Stack>
      </Group>
      <Stack gap={rem(4)}>
        <Title order={3}>design system</Title>
        <Group gap={rem(44)} align="start">
          <Stack gap={rem(8)}>
            <Text size="md" fw={500} style={{ letterSpacing: rem(-0.4) }}>
              Primary
            </Text>
            <Group align="start" gap={12}>
              <Stack gap={8} w={rem(80)}>
                {props.primaryColors?.map((color, index) => (
                  <Box key={index} h={40} bg={color} />
                ))}
              </Stack>
              <Text
                w={rem(240)}
                mt={rem(-4)}
                size="sm"
                style={{ letterSpacing: rem(-0.2) }}>
                {props.primaryDesc}
              </Text>
            </Group>
          </Stack>
          <Stack gap={8}>
            <Text size="md" fw={500} style={{ letterSpacing: rem(-0.4) }}>
              Secondary
            </Text>
            <Group align="start" justify="flex-start" gap={12}>
              <Group
                gap={8}
                wrap="wrap"
                align="start"
                justify="flex-start"
                w={rem(168)}>
                {props.secondaryColors?.map((color, index) => (
                  <Box
                    key={index}
                    h={40}
                    bg={color}
                    w={rem(80)}
                    style={{ flexGrow: 0, flexShrink: 0 }}
                  />
                ))}
              </Group>
              <Text
                w={rem(240)}
                mt={rem(-4)}
                size="sm"
                style={{ letterSpacing: rem(-0.2) }}>
                {props.secondaryDesc}
              </Text>
            </Group>
          </Stack>
          <Stack gap={8}>
            <Text size="md" fw={500} style={{ letterSpacing: rem(-0.2) }}>
              Fonts
            </Text>
            <Group align="start">
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
                  <Stack gap={0} align="start" justify="flex-start">
                    <Text c="1F1F1F" size="sm">
                      {font.name}
                    </Text>
                    <Text c="#9B9B9B" size="xs">
                      {font.style}
                    </Text>
                  </Stack>
                </Stack>
              ))}
              <Text
                w={rem(240)}
                mt={rem(-4)}
                size="sm"
                style={{ letterSpacing: rem(-0.2) }}>
                {props.fontDesc}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Stack>
      {props.content}
    </Stack>
  );
};

export default ProjectRoot;
