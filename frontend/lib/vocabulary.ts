export interface VocabWord {
  id: string;
  pashto: string;
  transliteration: string;
  english: string;
}

// Small starter deck for the Phase 1 MVP. In a later phase this would be
// fetched from a database / CMS instead of being hardcoded.
export const VOCABULARY: VocabWord[] = [
  { id: "w1", pashto: "سلام", transliteration: "salaam", english: "Hello" },
  { id: "w2", pashto: "مننه", transliteration: "manana", english: "Thank you" },
  { id: "w3", pashto: "پانی", transliteration: "obə", english: "Water" },
  { id: "w4", pashto: "کور", transliteration: "kor", english: "Home / House" },
  { id: "w5", pashto: "کتاب", transliteration: "kitaab", english: "Book" },
  { id: "w6", pashto: "زه", transliteration: "zə", english: "I / Me" },
  { id: "w7", pashto: "ښه", transliteration: "khə", english: "Good" },
  { id: "w8", pashto: "ډوډۍ", transliteration: "dodai", english: "Bread / Food" },
  { id: "w9", pashto: "دوست", transliteration: "dost", english: "Friend" },
  { id: "w10", pashto: "مکتب", transliteration: "maktab", english: "School" },
];
