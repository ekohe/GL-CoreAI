import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

/**
 * Reusable form field wrapper with consistent styling
 */
const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <div className="field is-horizontal settings-field">
      <div className="field-label is-normal">
        <label className="label">{label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormField;
