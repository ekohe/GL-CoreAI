import { AiBOT } from "../../utils/common";

const Footer = () => {
  return (
    <footer
      style={{
        position: 'fixed',
        fontSize: '1rem',
        lineHeight: '25px',
        width: '100%',
        bottom: 0,
        left: 0,
      }}
      className="dom-bg-color has-text-centered"
    >
      <div className="p-4">
        <p className="has-text-white">
          <strong className="has-text-white">{AiBOT.name}</strong> v{AiBOT?.version}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
