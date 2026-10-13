/**
 * Hikview Engineering client references (logos and project photos taken from
 * the company presentation, "References" section). Names are translated in
 * messages/*.json → projects.references.items.<id>.
 */
export type ReferenceCategory = "state" | "local" | "health" | "media" | "private";

export interface ClientReference {
  id: string;
  /** Public path of the logo or photo. */
  src: string;
  /** "logo" is shown contained on white, "photo" fills the tile. */
  kind: "logo" | "photo";
  category: ReferenceCategory;
}

export const referenceCategories: ReferenceCategory[] = ["state", "local", "health", "media", "private"];

export const clientReferences: ClientReference[] = [
  { id: "ministere-interieur", src: "/references/ministere-interieur.jpg", kind: "logo", category: "state" },
  { id: "ministere-transport", src: "/references/ministere-transport.jpg", kind: "logo", category: "state" },
  { id: "ministere-equipement", src: "/references/ministere-equipement.jpg", kind: "logo", category: "state" },
  { id: "ministere-education", src: "/references/ministere-education.png", kind: "logo", category: "state" },
  { id: "ministere-defense", src: "/references/ministere-defense.jpg", kind: "logo", category: "state" },
  { id: "commune-sbeitla", src: "/references/commune-sbeitla.jpg", kind: "logo", category: "local" },
  { id: "commune-tunis", src: "/references/commune-tunis.jpg", kind: "logo", category: "local" },
  { id: "hopital-sbeitla", src: "/references/hopital-sbeitla.jpg", kind: "photo", category: "health" },
  { id: "imko", src: "/references/imko.jpg", kind: "logo", category: "health" },
  { id: "iset-kasserine", src: "/references/iset-kasserine.png", kind: "logo", category: "health" },
  { id: "tv-tunisienne", src: "/references/tv-tunisienne.jpg", kind: "logo", category: "media" },
  { id: "ont", src: "/references/ont.png", kind: "logo", category: "media" },
  { id: "shell", src: "/references/shell.jpg", kind: "logo", category: "private" },
  { id: "oilibya", src: "/references/oilibya.png", kind: "logo", category: "private" },
  { id: "hotel-jeunesse", src: "/references/hotel-jeunesse.jpg", kind: "photo", category: "private" },
  { id: "hotel-marco-polo", src: "/references/hotel-marco-polo.jpg", kind: "photo", category: "private" },
  { id: "tunisie-telecom", src: "/references/tunisie-telecom.png", kind: "logo", category: "private" },
];
