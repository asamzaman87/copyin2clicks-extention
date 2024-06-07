import { Tooltip, type PlacesType } from "react-tooltip";

interface IReactToolTip {
  text: string;
  anchorSelect: string;
  clickable?: boolean;
  place: string;
}

export default function ReactToolTip({
  text,
  anchorSelect,
  clickable = true,
  place,
}: IReactToolTip) {
  return (
    <>
      <Tooltip
        className="react-tooltip"
        // className="active:scale-95"
        anchorSelect={anchorSelect}
        clickable={clickable}
        content={text}
        place={place}
      ></Tooltip>
    </>
  );
}
