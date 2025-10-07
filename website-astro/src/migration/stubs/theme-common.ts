export function useColorMode() {
  return { colorMode: 'dark', setColorMode: (_: string) => {} } as const;
}

