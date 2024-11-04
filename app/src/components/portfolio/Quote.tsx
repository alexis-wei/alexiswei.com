import React from 'react';
import { Title, rem, Group } from '@mantine/core';

const Foreword: React.FC = () => {
  return (
    <Group justify="center" align="center" mih="100dvh" px={rem(32)}>
      <Title fs="italic" order={6} ta="center">
        &quot;do the greatest thing ever, or something a little greater&quot;
      </Title>
    </Group>
  );
};

export default Foreword;
