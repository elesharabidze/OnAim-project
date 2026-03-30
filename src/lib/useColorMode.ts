import { useContext } from 'react'
import { ColorModeContext } from './colorModeContext'

export function useColorMode() {
  return useContext(ColorModeContext)
}
