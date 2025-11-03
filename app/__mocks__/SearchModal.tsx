import React from "react";

interface SearchModalProps {
  onClose: () => void;
  query: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, query }) => (
  <div data-testid="search-modal">
    <button onClick={onClose}>Close Search</button>
    <span>Query: {query}</span>
  </div>
);
