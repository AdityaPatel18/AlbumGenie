import React from "react";

const DropDown = ({ options, selectedFilters, onSelect }) => {
  const handleChange = (e) => {
    const { value, checked } = e.target;
    let updatedFilters = [...selectedFilters];

    if (checked) {
      updatedFilters.push(value);
    } else {
      updatedFilters = updatedFilters.filter((filter) => filter !== value);
    }

    onSelect(updatedFilters);
  };

  return (
    <div className="dropdown">
      <h3>Select Filters</h3>
      {options.map((filter, index) => (
        <label key={index}>
          <input
            type="checkbox"
            value={filter}
            checked={selectedFilters.includes(filter)}
            onChange={handleChange}
          />
          {filter}
        </label>
      ))}
    </div>
  );
};

export default DropDown;
