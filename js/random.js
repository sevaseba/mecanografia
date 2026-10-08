// Random helpers for varied (kids mode) messages.

/** A random item; with `avoid`, never the same one twice in a row (when there is a choice). */
export function pickOne(list, avoid) {
  const options = list.length > 1 && avoid !== undefined ? list.filter((item) => item !== avoid) : list;
  return options[Math.floor(Math.random() * options.length)];
}
