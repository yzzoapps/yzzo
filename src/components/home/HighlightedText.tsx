interface HighlightedTextProps {
  text: string;
  query: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, query }) => {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-300 text-neutral-black">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

export default HighlightedText;
