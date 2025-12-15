export const useDarkMode = () => {
  const colorMode = useColorMode()

  const isDark = computed(() => colorMode.value === 'dark')

  const toggle = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  const setDark = () => {
    colorMode.preference = 'dark'
  }

  const setLight = () => {
    colorMode.preference = 'light'
  }

  return {
    isDark,
    toggle,
    setDark,
    setLight,
    colorMode
  }
}
