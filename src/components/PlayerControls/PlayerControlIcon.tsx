import { Component, ParentProps } from "solid-js";

interface Props extends ParentProps {
  src: string;
  isDisabled?: boolean;
  enlargeIcon?: boolean;
  showActiveIndicator?: boolean;
  onClick?: () => void;
}

const PlayerControlIcon: Component<Props> = (props) => {
  const dimensions = props.enlargeIcon ? 72 : 48;
  return (
    <button
      class={`group relative outline-none focus-visible:ring-2 focus-visible:ring-cta rounded-full transition-all duration-200 ${!props.isDisabled ? "opacity-100 cursor-pointer hover:opacity-80" : "pointer-events-none opacity-25"
        }`}
      disabled={props.isDisabled}
      onClick={props.onClick}
    >
      <img class="group-hover:scale-110 transition-transform duration-200" src={props.src} width={dimensions} height={dimensions} />
      {props.showActiveIndicator && <span class="absolute -bottom-4 left-1/2 bg-cta rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] transition-all duration-300" style={{ width: "8px", height: "8px", "margin-left": "-4px" }}></span>}
    </button>
  );
};

export default PlayerControlIcon;
