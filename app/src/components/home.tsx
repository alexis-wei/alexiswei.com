'use client';
import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  rem,
} from '@mantine/core';
import BasilTwitterOutline from '~icons/basil/twitter-outline';
import HeroiconsEnvelope from '~icons/heroicons/envelope';
import HeroiconsCalendar from '~icons/heroicons/calendar';
import FeGithub from '~icons/fe/github';
import MovingGradient from './MovingGradient';

import classes from './page.module.css';
import { useState } from 'react';

export default function Home() {
  const [color, setColor] = useState('#ffffff');

  const changeColor = (colorNum: number) => {
    if (colorNum === 1) {
      setColor('#d0bfff');
    } else if (colorNum === 2) {
      setColor('#ffec99');
    } else if (colorNum === 3) {
      setColor('#d8f5a2');
    } else {
      setColor('#ffffff');
    }
  };

  return (
    <Flex
      justify="space-between"
      align="stretch"
      h="100dvh"
      w="100dvw"
      direction={{ base: 'column', sm: 'row' }}
      p={36}
      style={{ position: 'absolute' }}>
      <MovingGradient color={color} />
      <Stack gap={10} c="dark.7" w="full" h="full">
        <Stack gap={2}>
          <Group gap={4}>
            <Text
              fw={500}
              size="lg"
              style={{ letterSpacing: rem(-1), lineHeight: '1' }}>
              hi, i&apos;m
            </Text>
            <Title
              size="h3"
              style={{
                letterSpacing: rem(-1),
                textRendering: 'geometricPrecision',
                lineHeight: '1',
              }}>
              alexis
            </Title>
          </Group>
          <Text
            fw={500}
            size="lg"
            style={{
              letterSpacing: rem(-0.5),
              maxWidth: rem(280),
              lineHeight: '1.3',
            }}>
            a design engineer working with startups on:
          </Text>
        </Stack>
        <Group
          gap={8}
          style={{ maxWidth: rem(280) }}
          onMouseLeave={() => changeColor(0)}>
          <Button
            className={`${classes.button} ${classes.ar}`}
            variant="outline"
            onMouseEnter={() => changeColor(1)}>
            0→1 product
          </Button>
          <Button
            className={`${classes.button} ${classes.game}`}
            variant="outline"
            onMouseEnter={() => changeColor(2)}>
            branding
          </Button>
          <Button
            className={`${classes.button} ${classes.immerse}`}
            variant="outline"
            onMouseEnter={() => changeColor(3)}>
            immersive experiences
          </Button>
        </Group>
      </Stack>

      <Group gap={4} align="flex-start" c="dark.7" h="fit">
        <ActionIcon
          className={classes.contactButton}
          variant="transparent"
          onClick={() =>
            window.open('https://www.cal.com/itsalexiswei', '_blank')
          }>
          <HeroiconsCalendar />
        </ActionIcon>
        <ActionIcon
          className={classes.contactButton}
          variant="transparent"
          onClick={() =>
            window.open('https://www.x.com/itsalexiswei', '_blank')
          }>
          <BasilTwitterOutline />
        </ActionIcon>
        <ActionIcon
          className={classes.contactButton}
          variant="transparent"
          onClick={() => window.open('mailto:hi@alexiswei.com', '_blank')}>
          <HeroiconsEnvelope />
        </ActionIcon>
        <ActionIcon
          className={classes.contactButton}
          variant="transparent"
          onClick={() =>
            window.open('https://github.com/alexis-wei', '_blank')
          }>
          <FeGithub />
        </ActionIcon>
      </Group>
    </Flex>
  );
}
