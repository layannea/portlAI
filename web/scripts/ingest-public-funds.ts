#!/usr/bin/env node
/**
 * Ingests real public fund source data from official SEC sources.
 * No values are invented. Missing data is stored as null with a warning.
 * Run from the web/ directory: npm run ingest:public-funds
 */

import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";

import { FUND_TARGETS, type FundTarget } from "../src/data/public-fund-targets";

// ─── Config ──────────────────────────────────────────────────────────────────

const USER_AGENT = "Portl research contact@example.com";
const SEC_BASE = "https://www.sec.gov";
const DATA_SEC_BASE = "https://data.sec.gov";

const RATE_LIMIT_MS = 300;   // ~3 req/s — well under SEC's 10/s guideline
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = [1000, 3000, 8000];
const MAX_FILINGS_PER_FORM = 2;  // keep the 2 most recent of each form type
const MAX_DOC_BYTES = 2 * 1024 * 1024; // 2 MB cap per document

// N-1A is the initial registration; active funds file post-effective amendments
// as 485BPOS. We collect both form IDs in case an initial registration is recent.
const FORM_TYPES = ["N-1A", "485BPOS", "497K", "NPORT-P", "N-CEN", "N-CSR"] as const;
type FormType = (typeof FORM_TYPES)[number];

const OUTPUT_DIR = join(process.cwd(), "src", "data", "raw", "public");
const MF_TICKER_URL = `${SEC_BASE}/files/company_tickers_mf.json`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface SecMfFile {
  fields: string[];
  data: Array<[number, string, string, string]>; // [cik, seriesId, classId, symbol]
}

interface SecMfEntry {
  cik: number;
  seriesId: string;
  classId: string;
  symbol: string;
}

interface SubmissionsRecent {
  accessionNumber: string[];
  form: string[];
  filingDate: string[];
  primaryDocument: string[];
  primaryDocDescription: string[];
}

interface SecSubmissions {
  cik: string;
  name: string;
  filings: {
    recent: SubmissionsRecent;
    files: Array<{ name: string; filingCount: number; filingFrom: string; filingTo: string }>;
  };
}

interface FilingRecord {
  accessionNumber: string;
  formType: FormType;
  filingDate: string;
  primaryDocument: string;
  primaryDocUrl: string;
  filingIndexUrl: string;
  sourceUrl: string;
  downloadedBytes: number | null;
  truncated: boolean;
  localPath: string | null;
  warnings: string[];
}

interface FundIndexEntry {
  ticker: string;
  expectedName: string;
  secName: string | null;
  cik: string | null;
  seriesId: string | null;
  classId: string | null;
  retrievedAt: string;
  filingsFound: FilingRecord[];
  warnings: string[];
  sourceUrls: string[];
}

interface IndexFile {
  generatedAt: string;
  userAgent: string;
  rateLimit: { requestsPerSec: number; retries: number };
  formTypesCollected: string[];
  maxFilingsPerFormType: number;
  maxDocumentBytes: number;
  primarySources: string[];
  note: string;
  funds: FundIndexEntry[];
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
let lastRequestAt = 0;

async function secFetch(url: string, attempt = 0): Promise<Response | null> {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastRequestAt);
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/html, text/xml, */*",
      },
    });

    if (res.status === 429) {
      const backoff = RETRY_BACKOFF_MS[attempt] ?? 10000;
      console.warn(`    Rate limited. Waiting ${backoff}ms before retry…`);
      await sleep(backoff);
      if (attempt < MAX_RETRIES) return secFetch(url, attempt + 1);
      console.warn(`    Giving up after ${MAX_RETRIES} retries: ${url}`);
      return null;
    }

    if (res.status >= 500) {
      if (attempt < MAX_RETRIES) {
        const backoff = RETRY_BACKOFF_MS[attempt] ?? 5000;
        console.warn(`    HTTP ${res.status}, retrying in ${backoff}ms…`);
        await sleep(backoff);
        return secFetch(url, attempt + 1);
      }
    }

    if (!res.ok) {
      console.warn(`    HTTP ${res.status}: ${url}`);
      return null;
    }

    return res;
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      const backoff = RETRY_BACKOFF_MS[attempt] ?? 3000;
      console.warn(`    Network error (${err}). Retrying in ${backoff}ms…`);
      await sleep(backoff);
      return secFetch(url, attempt + 1);
    }
    console.warn(`    Failed after ${MAX_RETRIES} retries: ${url} — ${err}`);
    return null;
  }
}

// Download a document with a byte cap. Returns { content, truncated, totalBytes }.
async function downloadDoc(
  url: string
): Promise<{ content: Buffer; truncated: boolean; totalBytes: number } | null> {
  const res = await secFetch(url);
  if (!res || !res.body) return null;

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  let truncated = false;

  const reader = res.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;

      if (totalBytes > MAX_DOC_BYTES) {
        const keep = MAX_DOC_BYTES - (totalBytes - value.byteLength);
        if (keep > 0) chunks.push(Buffer.from(value.subarray(0, keep)));
        truncated = true;
        break;
      }

      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  return { content: Buffer.concat(chunks), truncated, totalBytes };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function padCik(cik: number): string {
  return String(cik).padStart(10, "0");
}

function cikToPath(cik: number): string {
  return String(cik); // EDGAR archive paths use unpadded CIK
}

function accNoToDir(accNo: string): string {
  return accNo.replace(/-/g, "");
}

function filingIndexUrl(paddedCik: string, accNo: string): string {
  const dir = accNoToDir(accNo);
  const safe = accNo.replace(/-/g, "-"); // preserve original dashes for index filename
  return `${SEC_BASE}/Archives/edgar/data/${parseInt(paddedCik, 10)}/${dir}/${safe}-index.htm`;
}

function primaryDocUrl(cik: number, accNo: string, primaryDoc: string): string {
  return `${SEC_BASE}/Archives/edgar/data/${cikToPath(cik)}/${accNoToDir(accNo)}/${primaryDoc}`;
}

// ─── Main ingestion ───────────────────────────────────────────────────────────

async function processFund(
  target: FundTarget,
  secEntry: SecMfEntry | null
): Promise<FundIndexEntry> {
  const now = new Date().toISOString();
  const entry: FundIndexEntry = {
    ticker: target.ticker,
    expectedName: target.expectedName,
    secName: null,
    cik: null,
    seriesId: null,
    classId: null,
    retrievedAt: now,
    filingsFound: [],
    warnings: [],
    sourceUrls: [MF_TICKER_URL],
  };

  if (!secEntry) {
    entry.warnings.push(
      `Ticker ${target.ticker} not found in ${MF_TICKER_URL}. Cannot retrieve filings.`
    );
    return entry;
  }

  const paddedCik = padCik(secEntry.cik);
  entry.cik = paddedCik;
  entry.seriesId = secEntry.seriesId || null;
  entry.classId = secEntry.classId || null;

  // Fetch EDGAR submissions
  const submissionsUrl = `${DATA_SEC_BASE}/submissions/CIK${paddedCik}.json`;
  entry.sourceUrls.push(submissionsUrl);
  console.log(`  Fetching submissions: ${submissionsUrl}`);

  const subRes = await secFetch(submissionsUrl);
  if (!subRes) {
    entry.warnings.push(`Could not fetch submissions from ${submissionsUrl}.`);
    return entry;
  }

  const submissions: SecSubmissions = await subRes.json();
  entry.secName = submissions.name;

  console.log(`  SEC registrant: ${submissions.name} | CIK: ${paddedCik}`);
  if (submissions.filings.files?.length) {
    entry.warnings.push(
      `Registrant has ${submissions.filings.files.length} additional archived submission file(s). ` +
        `Only the ${submissions.filings.recent.accessionNumber.length} most recent filings are searched here.`
    );
  }

  // Save raw submissions metadata (not all filings — just the header)
  const fundDir = join(OUTPUT_DIR, target.ticker);
  await mkdir(fundDir, { recursive: true });

  await writeFile(
    join(fundDir, "submissions-meta.json"),
    JSON.stringify(
      {
        sourceUrl: submissionsUrl,
        retrievedAt: new Date().toISOString(),
        cik: submissions.cik,
        registrantName: submissions.name,
        recentFilingsScanned: submissions.filings.recent.accessionNumber.length,
        archivedFilesNotScanned: submissions.filings.files ?? [],
        note: "Only 'recent' filings are included. Older filings are linked in archivedFilesNotScanned.",
      },
      null,
      2
    )
  );

  // Walk recent filings, collect matching form types (most recent N per type)
  const recent = submissions.filings.recent;
  const formCounts: Partial<Record<FormType, number>> = {};

  for (let i = 0; i < recent.accessionNumber.length; i++) {
    const form = recent.form[i] as FormType;
    if (!(FORM_TYPES as readonly string[]).includes(form)) continue;

    formCounts[form] = (formCounts[form] ?? 0) + 1;
    if (formCounts[form]! > MAX_FILINGS_PER_FORM) continue;

    const accNo = recent.accessionNumber[i];
    const filingDate = recent.filingDate[i];
    const primaryDoc = recent.primaryDocument[i];
    const docUrl = primaryDocUrl(secEntry.cik, accNo, primaryDoc);
    const indexUrl = filingIndexUrl(paddedCik, accNo);

    console.log(`    ${form}  ${filingDate}  ${accNo}`);

    const record: FilingRecord = {
      accessionNumber: accNo,
      formType: form,
      filingDate,
      primaryDocument: primaryDoc,
      primaryDocUrl: docUrl,
      filingIndexUrl: indexUrl,
      sourceUrl: docUrl,
      downloadedBytes: null,
      truncated: false,
      localPath: null,
      warnings: [],
    };

    // Create per-filing directory
    const filingDir = join(fundDir, accNoToDir(accNo));
    await mkdir(filingDir, { recursive: true });

    // Download primary document
    console.log(`      Downloading: ${docUrl}`);
    const dl = await downloadDoc(docUrl);

    if (!dl) {
      record.warnings.push(`Could not download primary document from ${docUrl}.`);
      console.warn(`      WARNING: download failed.`);
    } else {
      // Preserve subdirectory structure in the filename (e.g. xslFormNPORT-P_X01/primary_doc.xml)
      const subDirs = dirname(primaryDoc);
      const targetDir =
        subDirs && subDirs !== "."
          ? join(filingDir, subDirs)
          : filingDir;
      await mkdir(targetDir, { recursive: true });

      const localFile = join(targetDir, basename(primaryDoc));
      await writeFile(localFile, dl.content);

      record.downloadedBytes = dl.content.byteLength;
      record.truncated = dl.truncated;
      record.localPath = localFile.replace(process.cwd() + "/", "");

      const sizeLabel = (dl.content.byteLength / 1024).toFixed(1) + " KB";
      const tag = dl.truncated ? ` (TRUNCATED — full doc at ${docUrl})` : "";
      console.log(`      Saved ${sizeLabel}${tag}: ${record.localPath}`);

      if (dl.truncated) {
        record.warnings.push(
          `Document truncated at ${MAX_DOC_BYTES} bytes. Full document available at ${docUrl}`
        );
      }
    }

    // Save filing metadata alongside the document
    await writeFile(
      join(filingDir, "metadata.json"),
      JSON.stringify(record, null, 2)
    );

    entry.filingsFound.push(record);
  }

  if (entry.filingsFound.length === 0) {
    entry.warnings.push(
      `No filings found for form types [${FORM_TYPES.join(", ")}] in the ${
        recent.accessionNumber.length
      } most recent submissions.`
    );
  }

  // Check which form types were not found at all
  for (const ft of FORM_TYPES) {
    if (!formCounts[ft]) {
      entry.warnings.push(
        `Form type ${ft} not found in recent submissions. ` +
          (ft === "N-1A"
            ? "For funds with active registration, amendments are filed as 485BPOS."
            : "")
      );
    }
  }

  return entry;
}

async function main() {
  console.log("=".repeat(64));
  console.log("Portl — SEC public fund ingestion");
  console.log("User-Agent:", USER_AGENT);
  console.log("=".repeat(64));

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Step 1: load SEC MF ticker mapping
  console.log(`\nLoading SEC MF ticker mapping from:\n  ${MF_TICKER_URL}\n`);
  const mfRes = await secFetch(MF_TICKER_URL);
  if (!mfRes) {
    console.error("FATAL: Could not load SEC MF ticker file. Aborting.");
    process.exit(1);
  }

  const mfFile: SecMfFile = await mfRes.json();
  const [f0, f1, f2, f3] = mfFile.fields; // cik, seriesId, classId, symbol
  console.log(`Loaded ${mfFile.data.length} fund class entries.`);
  console.log(`Fields: [${mfFile.fields.join(", ")}]\n`);

  // Build symbol → entry map (uppercase for case-insensitive match)
  const tickerMap = new Map<string, SecMfEntry>();
  for (const row of mfFile.data) {
    const entry: SecMfEntry = {
      cik: row[mfFile.fields.indexOf("cik") as 0],
      seriesId: row[mfFile.fields.indexOf("seriesId") as 1],
      classId: row[mfFile.fields.indexOf("classId") as 2],
      symbol: row[mfFile.fields.indexOf("symbol") as 3],
    };
    if (entry.symbol) tickerMap.set(entry.symbol.toUpperCase(), entry);
  }

  // Step 2: process each target fund
  const indexEntries: FundIndexEntry[] = [];

  for (const target of FUND_TARGETS) {
    console.log("\n" + "─".repeat(64));
    console.log(`${target.ticker}  ${target.expectedName}`);
    console.log("─".repeat(64));

    const secEntry = tickerMap.get(target.ticker.toUpperCase()) ?? null;
    if (secEntry) {
      console.log(
        `  SEC mapping: CIK=${secEntry.cik}  series=${secEntry.seriesId}  class=${secEntry.classId}`
      );
    } else {
      console.warn(`  WARNING: ${target.ticker} not found in SEC MF ticker file.`);
    }

    const fundEntry = await processFund(target, secEntry);

    // Persist per-fund metadata snapshot
    const fundDir = join(OUTPUT_DIR, target.ticker);
    await mkdir(fundDir, { recursive: true });
    await writeFile(
      join(fundDir, "sec-mapping.json"),
      JSON.stringify(
        {
          sourceUrl: MF_TICKER_URL,
          retrievedAt: fundEntry.retrievedAt,
          ticker: target.ticker,
          expectedName: target.expectedName,
          secEntry: secEntry ?? null,
        },
        null,
        2
      )
    );

    indexEntries.push(fundEntry);
  }

  // Step 3: write index.json
  const indexPayload: IndexFile = {
    generatedAt: new Date().toISOString(),
    userAgent: USER_AGENT,
    rateLimit: { requestsPerSec: Math.floor(1000 / RATE_LIMIT_MS), retries: MAX_RETRIES },
    formTypesCollected: [...FORM_TYPES],
    maxFilingsPerFormType: MAX_FILINGS_PER_FORM,
    maxDocumentBytes: MAX_DOC_BYTES,
    primarySources: [
      MF_TICKER_URL,
      `${DATA_SEC_BASE}/submissions/CIK{paddedCik}.json`,
      `${SEC_BASE}/Archives/edgar/data/{cik}/{accessionDir}/{primaryDocument}`,
    ],
    note:
      "All values are derived from official SEC filings. No data has been invented or estimated. " +
      "Fields that could not be retrieved are null with an accompanying warning. " +
      "Documents truncated at 2 MB include the full source URL.",
    funds: indexEntries,
  };

  await writeFile(
    join(OUTPUT_DIR, "index.json"),
    JSON.stringify(indexPayload, null, 2)
  );

  // Step 4: print summary
  console.log("\n" + "=".repeat(64));
  console.log("Ingestion complete\n");

  let totalFilings = 0;
  let totalWarnings = 0;

  for (const e of indexEntries) {
    totalFilings += e.filingsFound.length;
    totalWarnings += e.warnings.length;
    const status = e.cik
      ? `CIK ${e.cik}  ${e.filingsFound.length} filing(s)`
      : "NOT FOUND IN SEC TICKER FILE";
    const warnTag = e.warnings.length ? `  ⚠ ${e.warnings.length} warning(s)` : "";
    console.log(`  ${e.ticker.padEnd(7)} ${status}${warnTag}`);
  }

  console.log(`\nTotal filings collected : ${totalFilings}`);
  console.log(`Total warnings          : ${totalWarnings}`);
  console.log(`Output directory        : ${OUTPUT_DIR}`);
  console.log(`Index file              : ${join(OUTPUT_DIR, "index.json")}`);
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
