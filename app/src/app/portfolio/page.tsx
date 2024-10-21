'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Stack,
  Title,
  Text,
  Button,
  rem,
  Affix,
  Transition,
} from '@mantine/core';
import TheDrop from '@/components/portfolio/TheDrop';
import Phoenix from '@/components/portfolio/Phoenix';
import Space from '@/components/portfolio/Space';
import classes from '@/components/portfolio/portfolio.module.css';
import Foreword from '@/components/portfolio/Foreword';
import { useWindowScroll } from '@mantine/hooks';

interface ProjectButtonProps {
  title: string;
  id: string;
}

const ProjectButton: React.FC<ProjectButtonProps> = ({ title, id }) => {
  const handleClick = useCallback(() => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      setTimeout(() => {
        window.scrollTo({
          top: element.offsetTop,
          behavior: 'auto',
        });
      }, 800);
    }
  }, [id]);

  return (
    <Button
      variant="transparent"
      m="0"
      p="0"
      onClick={handleClick}
      className={classes.projectButton}>
      <Text c="#1f1f1f">{title}</Text>
    </Button>
  );
};

export default function Portfolio() {
  const [scroll, scrollTo] = useWindowScroll();
  const buttons: ProjectButtonProps[] = [
    { title: '00 // foreword', id: 'foreword' },
    { title: '01 // space', id: 'space' },
    { title: '02 // the drop', id: 'thedrop' },
    { title: '03 // phoenix', id: 'phoenix' },
  ];
  return (
    <Stack pb={20} align="center">
      <Stack gap={80} pb={200} w="100%" h="100%">
        <Stack
          w="full"
          justify="center"
          align="center"
          h="100vh"
          style={{ color: '#1f1f1f' }}>
          <Title order={4}>table of contents</Title>
          <Stack align="start" gap={0}>
            {buttons.map((button) => (
              <ProjectButton
                key={button.id}
                title={button.title}
                id={button.id}
              />
            ))}
          </Stack>
        </Stack>
        <Box id="foreword">
          <Foreword />
        </Box>
        <Box id="space">
          <Space />
        </Box>
        <Box id="thedrop">
          <TheDrop />
        </Box>
        <Box id="phoenix">
          <Phoenix />
        </Box>
      </Stack>
      <Text size="xs">with love, alexis</Text>
      <Affix position={{ bottom: '10%', right: 24 }}>
        <Transition
          transition="slide-up"
          mounted={
            typeof window !== 'undefined' && scroll.y > window.innerHeight
          }>
          {(style) => (
            <Button
              variant="transparent"
              radius="xl"
              bg="rgba(255,255,255,0.62)"
              size="compact-sm"
              style={style}
              c="#1f1f1f"
              fz={12}
              onClick={() => {
                scrollTo({ y: 0 });
              }}>
              ↑ top
            </Button>
          )}
        </Transition>
      </Affix>
    </Stack>
  );
}
