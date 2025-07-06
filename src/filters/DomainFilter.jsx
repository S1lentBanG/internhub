import React from 'react';
import Select from 'react-select';

// Define the default (current) styles and theme
const defaultStyles = {
  control: (base, state) => ({
    ...base,
    background: 'linear-gradient(120deg, #232136 0%, #3b2c59 100%)',
    borderColor: state.isFocused ? '#a21caf' : '#232136',
    boxShadow: state.isFocused
      ? '0 8px 32px 0 rgba(162,28,175,0.18)'
      : '0 4px 16px 0 rgba(162,28,175,0.10)',
    borderWidth: state.isFocused ? 2 : 1,
    borderRadius: '1rem',
    color: '#f3f4f6',
    minHeight: 44,
    transition: 'box-shadow 0.3s cubic-bezier(.4,2,.6,1), border-color 0.2s',
  }),
  menu: base => ({
    ...base,
    borderRadius: '1rem',
    marginTop: 8,
    background: 'linear-gradient(120deg, #18181b 0%, #a21caf 100%)',
    boxShadow: '0 12px 48px 0 rgba(162,28,175,0.18)',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? 'linear-gradient(90deg, #a21caf 0%, #6366f1 100%)'
      : state.isFocused
      ? 'rgba(162,28,175,0.15)'
      : 'transparent',
    color: state.isSelected ? '#fff' : '#f3f4f6',
    borderRadius: '0.75rem',
    fontWeight: state.isSelected ? 600 : 500,
    transition: 'background 0.2s',
    cursor: 'pointer',
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
  singleValue: base => ({ ...base, color: '#f3f4f6', fontWeight: 600, textShadow: '0 1px 8px rgba(162,28,175,0.10)' }),
  placeholder: base => ({ ...base, color: '#a78bfa', fontWeight: 500 }),
  input: base => ({ ...base, color: '#f3f4f6' }),
  dropdownIndicator: base => ({ ...base, color: '#a78bfa' }),
  indicatorSeparator: base => ({ ...base, backgroundColor: '#a78bfa' }),
  clearIndicator: base => ({ ...base, color: '#a78bfa' }),
};

const defaultThemeColors = theme => ({
  ...theme,
  borderRadius: 16,
  colors: {
    ...theme.colors,
    primary25: '#a78bfa',
    primary: '#a21caf',
    neutral0: '#232136', 
    neutral80: '#f3f4f6', 
  },
});

// Define the new minimal styles and theme for FROSTED GLASS effect
const minimalStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    backdropFilter: 'blur(10px) saturate(180%)',
    WebkitBackdropFilter: 'blur(10px) saturate(180%)', 
    borderColor: state.isFocused ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.25)',
    boxShadow: state.isFocused ? `0 0 0 1px rgba(59, 130, 246, 0.8)` : 'none',
    borderRadius: '0.5rem',
    minHeight: '40px',
    fontSize: '0.875rem',
    color: 'rgb(229, 231, 235)', 
    '&:hover': {
      borderColor: state.isFocused ? 'rgba(59, 130, 246, 0.9)' : 'rgba(255, 255, 255, 0.4)',
    },
  }),
  menu: base => ({
    ...base,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    borderRadius: '0.5rem',
    marginTop: '8px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? 'rgba(59, 130, 246, 0.7)' : state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    color: state.isSelected ? 'white' : 'rgb(209, 213, 219)',
    borderRadius: '0.375rem',
    padding: '0.6rem 0.85rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    margin: '0.125rem 0.25rem',
    width: 'calc(100% - 0.5rem)',
    '&:hover': { 
        backgroundColor: state.isSelected ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.15)',
    }
  }),
  singleValue: base => ({ ...base, color: 'rgb(229, 231, 235)', fontSize: '0.875rem' }),
  placeholder: base => ({ ...base, color: 'rgb(156, 163, 175)', fontSize: '0.875rem' }),
  input: base => ({ ...base, color: 'rgb(229, 231, 235)', fontSize: '0.875rem' }),
  dropdownIndicator: base => ({ ...base, color: 'rgb(156, 163, 175)' }),
  indicatorSeparator: () => ({ display: 'none' }),
  clearIndicator: base => ({ ...base, color: 'rgb(156, 163, 175)', '&:hover': { color: 'rgb(209, 213, 219)' } }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
};

const minimalThemeColors = theme => ({
  ...theme,
  borderRadius: 8,
  colors: {
    ...theme.colors,
    primary: 'rgba(59, 130, 246, 0.9)',
    primary75: 'rgba(59, 130, 246, 0.7)',
    primary50: 'rgba(59, 130, 246, 0.5)',
    primary25: 'rgba(59, 130, 246, 0.25)',
    danger: '#e53e3e',
    dangerLight: '#fef2f2',
    neutral0: 'transparent',
    neutral5: 'rgba(255, 255, 255, 0.1)',
    neutral10: 'rgba(255, 255, 255, 0.05)',
    neutral20: 'rgba(255, 255, 255, 0.25)',
    neutral30: 'rgba(255, 255, 255, 0.4)',
    neutral40: 'rgb(156, 163, 175)',
    neutral50: 'rgb(209, 213, 219)',
    neutral80: 'rgb(229, 231, 235)',
  },
});

export default function DomainFilter({ value, onChange, options = [], variant = 'default' }) {
  const formattedOptions = options.map(opt => (
    typeof opt === 'object' && opt.value !== undefined ? opt : { value: opt, label: opt }
  ));
  const selectedOption = formattedOptions.find(opt => opt.value === value) || null;

  const activeStyles = variant === 'minimal' ? minimalStyles : defaultStyles;
  const activeTheme = variant === 'minimal' ? minimalThemeColors : defaultThemeColors;
  
  const baseClassName = variant === 'minimal' ? "w-full" : "min-w-[180px] rounded-xl";

  return (
    <Select
      className={baseClassName}
      classNamePrefix="react-select"
      options={formattedOptions}
      value={selectedOption}
      onChange={opt => onChange(opt ? opt.value : '')}
      placeholder="Select Domain"
      isClearable
      menuPortalTarget={document.body} 
      styles={activeStyles}
      theme={activeTheme}
    />
  );
}