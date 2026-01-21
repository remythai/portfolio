import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export const smoothScrollTo = (target: string) => {
  gsap.to(window, {
    duration: 1.2,
    scrollTo: {
      y: target,
      offsetY: 0
    },
    ease: "power3.inOut"
  });
};
