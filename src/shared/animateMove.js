import { CSSRulePlugin } from "gsap/CSSRulePlugin";
import { gsap, TimelineLite, Bounce } from "gsap";

gsap.registerPlugin(CSSRulePlugin);

const animateMove = ({ x, y, onComplete, top }) => {
  const token = CSSRulePlugin.getRule(
    `.GameGrid-Table thead td.header.current span:after`
  );
  const tl = new TimelineLite({ onComplete });
  tl.to(token, 1, {
    top: top + "px",
    ease: Bounce.easeOut,
  }).set(token, {
    top: 0,
  });
};

export default animateMove;
