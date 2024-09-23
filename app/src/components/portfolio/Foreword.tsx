import React from "react";
import { Stack, Title, rem, Text, Group } from "@mantine/core";

const Foreword: React.FC = () => {
  return (
    <Stack>
      <Stack justify="center" align="center" gap={rem(20)} mih="100vh">
        <Stack align="start" justify="flex-start" w={rem(320)}>
          <Title
            order={4}
            style={{
              letterSpacing: rem(-1),
            }}>
            foreword
          </Title>
          <Text
            size="sm"
            style={{
              letterSpacing: rem(-0.4),
            }}>
            welcome to my portfolio — a collection of projects shaping my
            journey as a creative maker
            <br />
            <br />
            i get easily excited by new mediums, a chance to break new ground
            and products that i can see myself using. you can see this portfolio
            as a gallery of explorations that have made my heart flutter
            <br />
            <br />
            enjoy your journey & get a lil inspired ✧<br />
            <br />
            lovefrom, alexis
          </Text>
        </Stack>
      </Stack>
      <Group justify="center" align="center" mih="100vh" px={rem(32)}>
        <Title fs="italic" order={6} ta="center">
          &quot;do the greatest thing ever, or something a little greater&quot;
        </Title>
      </Group>
    </Stack>
  );
};

export default Foreword;
