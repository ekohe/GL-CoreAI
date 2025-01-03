/* eslint-disable no-extend-native */
declare global {
  interface String {
    titlize(): string;
  }
}

export function enhanceStringPrototype(): void {
  if (!String.prototype.titlize) {
    String.prototype.titlize = function (): string {
      return this.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };
  }
}
