'use client';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Button } from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/color-mode';

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Button
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      variant="ghost"
      color="current"
      onClick={toggleColorMode}
      size="md"
    >
      {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
} 