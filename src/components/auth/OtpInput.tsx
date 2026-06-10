import { useRef, useState } from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function OtpInput({ value, onChange, maxLength = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste event
      const pastedData = val.slice(0, maxLength - index);
      const newValue = value.slice(0, index) + pastedData + value.slice(index + pastedData.length);
      onChange(newValue.slice(0, maxLength));
      
      // Focus next input after last pasted digit
      const nextIndex = Math.min(index + pastedData.length, maxLength - 1);
      inputRefs.current[nextIndex]?.focus();
    } else if (val.match(REGEXP_ONLY_DIGITS)) {
      // Handle single digit input
      const newValue = value.slice(0, index) + val + value.slice(index + 1);
      onChange(newValue.slice(0, maxLength));
      
      // Auto-advance to next input
      if (val && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLength);
    onChange(pastedData);
    
    // Focus the input after the last pasted digit
    const nextIndex = Math.min(pastedData.length, maxLength - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: maxLength }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          onPaste={handlePaste}
          className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-colors
            ${focusedIndex === index 
              ? 'border-green-500 ring-2 ring-green-200' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${value[index] ? 'bg-green-50 border-green-400' : 'bg-white'}
          `}
        />
      ))}
    </div>
  );
}
