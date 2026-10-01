import { Fragment, memo } from "react";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function HighlightImpl({ text, words }: { text: string; words: string[] }) {
  if (!text || !words.length) return <>{text}</>;
  const re = new RegExp(`(${words.map(esc).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <mark key={i}>{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

export default memo(HighlightImpl);
