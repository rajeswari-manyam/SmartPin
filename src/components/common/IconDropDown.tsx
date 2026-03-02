import React from "react";

interface Option {
    id?: string | number;
    name: string;
    icon?: string;
}

interface Props {
    label: string;
    value: string;
    options: Option[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const IconSelect: React.FC<Props> = ({
    label,
    value,
    options,
    placeholder,
    onChange,
    disabled,
}) => {
    const [open, setOpen] = React.useState(false);

    const selected = options.find(
        (o) => String(o.id ?? o.name) === value
    );

    return (
        <div className="relative">
            <label className="block mb-2 font-semibold text-gray-800 text-base">
                {label}
            </label>

            {/* Selected */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-xl bg-white
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"}`}
            >
                {selected ? (
                    <div className="flex items-center gap-3 min-w-0">
                        {selected.icon && (
                            <img
                                src={selected.icon}
                                alt={selected.name}
                                className="w-8 h-8 object-contain shrink-0"  // ✅ increased from w-5 h-5
                            />
                        )}
                        <span className="truncate text-base font-medium">{selected.name}</span>  {/* ✅ increased */}
                    </div>
                ) : (
                    <span className="text-gray-400 text-base">{placeholder}</span>  // ✅ increased
                )}
                <span className="ml-2 text-lg">▾</span>
            </button>

            {/* Dropdown */}
            {open && !disabled && (
                <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-64 overflow-auto">
                    {options.map((opt) => (
                        <button
                            key={opt.id ?? opt.name}
                            onClick={() => {
                                onChange(String(opt.id ?? opt.name));
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-100 text-left"
                        >
                            {opt.icon && (
                                <img
                                    src={opt.icon}
                                    alt={opt.name}
                                    className="w-8 h-8 object-contain shrink-0"  // ✅ increased from w-5 h-5
                                />
                            )}
                            <span className="text-base font-medium">{opt.name}</span>  {/* ✅ increased */}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IconSelect;