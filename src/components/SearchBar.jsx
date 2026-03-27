import { useMarket } from '../context/useMarket';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useMarket();

  return (
    <div className="search-wrapper">
      <Search size={16} className="search-icon" />
      <input
        id="search-input"
        type="text"
        className="search-input"
        placeholder="Search by name or symbol..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        aria-label="Search cryptocurrencies"
      />
      {searchQuery && (
        <button
          className="search-clear"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
