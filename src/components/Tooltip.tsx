import React from "react"

function Tooltip({ text }) {
  return (
    <div className="alert absolute   left-0 right-0 top-12 bottom-14 z-50  bg-gray-200 bg-opacity-30 rounded-md transition-all  duration-300">
      <span className="absolute p-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-nowrap text-white mx-auto my-auto  text-center text-base font-bold rounded-md">
        {text}
      </span>
    </div>
  )
}

export default Tooltip
