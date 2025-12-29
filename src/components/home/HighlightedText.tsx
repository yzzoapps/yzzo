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
          <mark key={index} className="bg-accent text-primary">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
};

export default HighlightedText;
