import { AiBOT } from "../../utils/common";

const Footer = () => {
  return (
    <footer
      style={{
        position: 'fixed',
        fontSize: '1rem',
        lineHeight: '50px',
        width: '100%',
        bottom: 0,
        left: 0,
      }}
      className="dom-bg-color has-text-centered"
    >
      <div className="p-2">
        <p className="has-text-black">
          <strong className="has-text-black">{AiBOT.name}</strong> v{AiBOT?.version}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
