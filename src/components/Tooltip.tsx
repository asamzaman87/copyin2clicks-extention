import React from "react";
import { NOEXTENTION, INVALID_EXTENSION } from "src/utils/constants";

function Tooltip({ text }) {
  console.log(text);
  let alertType = "success";
  if (
    text === NOEXTENTION ||
    text.includes(INVALID_EXTENSION) ||
    text === "Please Set File Extension!" ||
    text === "At Least One Item Must Remain Unstarred!" ||
    text === "No Unstarred Items To Delete!" ||
    text === "Upgrade Premium To Download!" ||
    text === "This item cannot be starred/unstarred!" ||
    text === "Cannot remove item!"
  ) {
    alertType = "error";
  }

  return (
    <div className="alert absolute left-0 right-0 top-12 bottom-14 z-50 bg-gray-200 bg-opacity-30 rounded-md transition-all duration-300 flex justify-center items-center">
      <span
        className={`p-2 max-w-xs sm:max-w-sm lg:max-w-lg ${alertType === "error" ? "bg-red-500" : "bg-green-500"} text-white text-center text-base font-bold rounded-md`}
      >
        {text}
      </span>
    </div>
  );
}

export default Tooltip;
