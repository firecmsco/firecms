import { useInjectStyles } from "./useInjectStyles";

export type IconStyle = {
    fill?: boolean;
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    grad?: -25 | 0 | 200;
    opticalSize?: 20 | 24 | 40 | 48;
}

export function useIconStyles({
                                  fill = true,
                                  weight = 500,
                                  grad = 0,
                                  opticalSize = 24
                              } : IconStyle) {
    useInjectStyles("icons", `
.material-symbols-rounded {
  font-variation-settings: 'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grad}, 'opsz' ${opticalSize};
}`);
}
