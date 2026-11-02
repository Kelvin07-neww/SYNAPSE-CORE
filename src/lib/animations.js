const ease = [0.22, 1, 0.36, 1];

export const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
export const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };
export const scaleIn = { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } } };
export const slideLeft = { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } };
export const slideRight = { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease } } };
export const stagger = (delay = 0.08) => ({ hidden: {}, show: { transition: { staggerChildren: delay } } });

// props siap pakai untuk elemen yang muncul saat masuk viewport
export const reveal = (variants = fadeUp) => ({
  variants,
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.2 },
});
