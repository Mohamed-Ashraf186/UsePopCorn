import { useState } from "react";

export default function Search({ setQuery, query }) {
  // const [tempQuery, setTempQuery] = useState("");
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
