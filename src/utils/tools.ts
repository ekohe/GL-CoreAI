import { toast } from "bulma-toast";

const hexToRGB = (
  hex: string | undefined,
  opacity: number | undefined
): string => {
  if (hex !== undefined) {
    // Remove the leading hash if it's there
    hex = hex.replace(/^#/, "");

    // Parse the 6-digit hex value
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (opacity === undefined) opacity = 1;
    // Return the RGB value
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else {
    return "";
  }
};

const isEmail = (email: string) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const toastMessage = (message: string, messagetype: any) => {
  return toast({
    message: message,
    type: messagetype,
    duration: 5000,
    position: "top-left",
    pauseOnHover: true,
    animate: { in: "fadeIn", out: "fadeOut" },
  });
};

export { hexToRGB, isEmail, toastMessage };
