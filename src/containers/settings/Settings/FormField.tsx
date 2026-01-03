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
    <div className="field is-horizontal">
      <div
        className="field-label"
        style={{
          justifyContent: "right",
          alignItems: "center",
          display: "flex",
        }}
      >
        <label className="label has-text-black">{label}</label>
      </div>
      <div className="field-body">
        <div className="field is-expanded">
          <div className="field has-addons">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FormField;

