import { useWindowDimensions } from "react-native";

export type Breakpoints = {
  width: number;
  height: number;
  isIPad: boolean;
  isLargePhone: boolean;
  isSmallPhone: boolean;
  gridColumns: number;
  hPad: number;
};

export function useBreakpoints(): Breakpoints {
  const { width, height } = useWindowDimensions();
  const isIPad = width >= 768;
  const isLargePhone = !isIPad && width >= 428;
  const isSmallPhone = !isIPad && width <= 375;

  return {
    width,
    height,
    isIPad,
    isLargePhone,
    isSmallPhone,
    gridColumns: isLargePhone ? 3 : 2,
    hPad: isLargePhone ? 20 : 18,
  };
}
