export function vibrate(pattern = 25, enabled = true) {
  if (!enabled || typeof window === "undefined") return;
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // some browsers throw if called outside a user gesture — ignore
    }
  }
}
