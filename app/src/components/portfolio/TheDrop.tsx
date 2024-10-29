import React from 'react';
import { Stack, Title, Text, Group, rem, Image } from '@mantine/core';
import ProjectRoot from '@/components/portfolio/ProjectRoot';
import { VideoProps } from './types';

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
          width: '240px',
          height: '444px',
          borderRadius: '16px',
          outline: '1px solid #333333',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
        }}>
        <video
          src={uri}
          muted={true}
          autoPlay={true}
          loop={true}
          playsInline={true}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <Text size="sm" fw={500} style={{ letterSpacing: rem(-0.2) }}>
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
        oneLiner="a video based shoppable link in bio – think simplified shopify"
        description="The Drop helps sellers that have a social presence to own their audience and help them grow. 
        We minimize their reliance on third party platforms such as depop and etsy through offering a simple way to have their own platform. 
        We started with offering a unique drop format that works best for one of a kind goods"
        details="our UX prioritizes simplicity for a less technical audience. 
        How can we minimize the number of screens before a purchase can be made? 
        What is the simplest way for sellers to onboard and upload their products to get ready for selling?
        All while considering the primary entry point of Instagram, how to create the best in-app browser experience?"
        primaryColors={['#121212', '#FFFFFF', '#FFD218']}
        primaryDesc="clean neutrals create trust while allowing each seller to show off their own character through their items"
        secondaryColors={[
          '#002199',
          '#FF8A22',
          '#FA1813',
          '#389910',
          '#D9D9D9',
          '#FFD218',
        ]}
        secondaryDesc="the platform primarily targets vintage sellers, think hippie, fun, funky pops of colors"
        fonts={[
          { name: 'instrument serif', style: 'regular' },
          {
            name: 'instrument sans',
            style: 'semibold',
            imgUri:
              'https://pub-8e556b3da43842e584bb713fa8c84f5f.r2.dev/instrument-sans.jpg',
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
