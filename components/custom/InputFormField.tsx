import React from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface FieldExtraProps {
  className?: string;
}

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface InputFormFieldProps extends FieldExtraProps {
  label: string;
  labelNote?: string;
  name: string;
  type: string;
  placeholder?: string;
  rows?: number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<FieldElement>) => void;
  onBlur?: (e: React.FocusEvent<FieldElement>) => void;
  error?: string;
  required?: boolean;
  selectData?: SelectOption[];
  disabled?: boolean;
}

const InputFormField = React.forwardRef<FieldElement, InputFormFieldProps>(
  function InputFormField(
    {
      label,
      labelNote,
      name,
      rows,
      type,
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      required,
      selectData,
      disabled,
      className,
    },
    ref,
  ) {
    const invalidClass = error ? "border-red-500 focus:border-red-500" : "";
    const defaultClass =
      "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground";
    const fieldClassName = `${className || defaultClass} ${invalidClass}`;
    const valueProps = value !== undefined ? { value } : {};

    let field: React.ReactNode;
    switch (type) {
      case "textarea":
        field = (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={name}
            name={name}
            placeholder={placeholder}
            rows={rows}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          />
        );
        break;
      case "select":
        field = (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={name}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          >
            {selectData?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;
      case "date":
        field = (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="date"
            id={name}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          />
        );
        break;
      case "number":
        field = (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="number"
            id={name}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          />
        );
        break;
      case "email":
        field = (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="email"
            id={name}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          />
        );
        break;
      default:
        field = (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="text"
            id={name}
            name={name}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={fieldClassName}
            {...valueProps}
          />
        );
    }

    return (
      <div className="space-y-1.5">
        <div>
          <label
            htmlFor={name}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
          {labelNote && <span>{labelNote}</span>}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </div>
        {field}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    );
  },
);

export default InputFormField;
