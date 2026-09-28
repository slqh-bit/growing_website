import path from "path";

/**
 * Quote PDFs (QuoteDocuments uploads). Deliberately NOT under media/: the public
 * Media collection serves any file inside its directory without a database
 * check, so a subfolder there would make client quotes downloadable by anyone.
 * In production this is its own Docker volume, backed up with the database.
 */
export const quotesDir = path.resolve(process.cwd(), "quotes");

/** Largest quote PDF accepted (also keeps the email attachment deliverable). */
export const MAX_QUOTE_BYTES = 10 * 1024 * 1024;
