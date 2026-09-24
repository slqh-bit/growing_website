/**
 * Minimal Lexical editor-state builder: plain text → paragraphs.
 * Blank lines separate paragraphs. Arabic text gets `direction: "rtl"`.
 * Used by the seed script and any future content import.
 */
export interface LexicalState {
  [k: string]: unknown;
  root: {
    [k: string]: unknown;
    type: string;
    children: { type: string; version: number; [k: string]: unknown }[];
    direction: "ltr" | "rtl" | null;
    format: "" | "left" | "start" | "center" | "right" | "end" | "justify";
    indent: number;
    version: number;
  };
}

export function lexicalFromText(text: string, dir: "ltr" | "rtl" = "ltr"): LexicalState {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: dir,
      children: paragraphs.map((paragraph) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: dir,
        textFormat: 0,
        textStyle: "",
        children: [
          {
            type: "text",
            text: paragraph,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      })),
    },
  };
}
