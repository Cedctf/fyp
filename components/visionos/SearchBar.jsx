import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search articles..." }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-[rgb(27,55,121)]/50 group-focus-within:text-[rgb(87,17,17)] transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full py-4 pl-12 pr-6
          bg-[rgb(242,240,235)]/50 backdrop-blur-md border border-[rgb(27,55,121)]/10
          rounded-2xl
          text-[rgb(27,55,121)] placeholder-[rgb(27,55,121)]/40
          outline-none
          focus:bg-white focus:border-[rgb(27,55,121)]/30 focus:shadow-lg
          transition-all duration-300
        "
      />
    </div>
  );
};

export default SearchBar;
