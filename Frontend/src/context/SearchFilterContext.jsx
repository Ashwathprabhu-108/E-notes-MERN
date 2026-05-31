import React, { createContext, useState, useCallback } from 'react';

export const SearchFilterContext = createContext();

export const SearchFilterProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
  }, []);

  return (
    <SearchFilterContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      resetFilters,
    }}>
      {children}
    </SearchFilterContext.Provider>
  );
};

export const useSearchFilter = () => {
  const context = React.useContext(SearchFilterContext);
  if (!context) {
    throw new Error('useSearchFilter must be used within SearchFilterProvider');
  }
  return context;
};
