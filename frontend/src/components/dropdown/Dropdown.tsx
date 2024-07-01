import { useState, FC} from "react";

type CustomDropdownProps = {
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
};

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (value: number) => {
    onChange(value);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="dropdown">
      <div className="dropbtn" onClick={() => setIsOpen(!isOpen)}>
        {selectedOption?.label}
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {options.map((option) => (
            <div
              key={option.value}
              className="option"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;