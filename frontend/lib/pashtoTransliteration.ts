const LETTER_MAP: Record<string, string> = {
  a: "ا",
  A: "آ",
  b: "ب",
  p: "پ",
  t: "ت",
  T: "ټ",
  s: "س",
  S: "ص",
  j: "ج",
  J: "ځ",
  c: "چ",
  C: "څ",
  h: "ه",
  H: "ح",
  x: "خ",
  X: "خ",
  d: "د",
  D: "ډ",
  r: "ر",
  R: "ړ",
  z: "ز",
  Z: "ژ",
  g: "ګ",
  G: "غ",
  f: "ف",
  q: "ق",
  k: "ک",
  l: "ل",
  m: "م",
  n: "ن",
  N: "ڼ",
  w: "و",
  v: "و",
  o: "و",
  u: "و",
  e: "ې",
  E: "ۍ",
  i: "ي",
  I: "ی",
  y: "ی",
  "'": "ء",
};

const DIGRAPH_REPLACEMENTS: Record<string, string> = {
  "سh": "ش",
  "کh": "خ",
  "ګh": "غ",
  "زh": "ژ",
  "تs": "څ",
  "دz": "ځ",
  "چh": "چ",
};

/** Converts phonetic Latin keystrokes to Pashto without altering Pashto text. */
export function transliterateToPashto(value: string) {
  const output: string[] = [];

  for (const character of value) {
    const pashtoCharacter = LETTER_MAP[character];
    if (!pashtoCharacter) {
      output.push(character);
      continue;
    }

    const previousCharacter = output[output.length - 1];
    const digraph = previousCharacter && DIGRAPH_REPLACEMENTS[`${previousCharacter}${character}`];

    if (digraph) {
      output[output.length - 1] = digraph;
    } else {
      output.push(pashtoCharacter);
    }
  }

  return output.join("");
}
