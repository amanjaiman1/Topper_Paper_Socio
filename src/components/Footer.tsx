import { REPO_URL, sheetUrl } from "@/lib/dataset";

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-5 pb-10 text-[13px] text-copy/45 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>Answer copies belong to their respective authors and institutes. Shared for educational reference.</p>
      <p className="flex gap-4">
        <a href={sheetUrl} target="_blank" rel="noreferrer" className="hover:text-copy">
          Source sheet
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:text-copy">
          GitHub
        </a>
      </p>
    </footer>
  );
}
