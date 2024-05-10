import React, { useState } from "react"

import Actions from "./Actions"

function Item({ text }) {
  const [showActions, setShowActions] = useState(false)
  function showActionsFunc(action: boolean, id: string) {
    setShowActions(action)
  }
  return (
    <div
      onMouseOver={() => showActionsFunc(true, "")}
      onMouseLeave={() => showActionsFunc(false, "")}
      className={`${showActions ? "scale-[101%]" : ""} h-10 flex gap-2 items-center  justify-between bg-white p-2 border-2 border-gray-600 rounded-md shadow transition-all duration-100 cursor-default`}>
      <p title={text} className="truncate text-sm">
        {text}
      </p>
      {showActions && <Actions text={text} />}
    </div>
  )
}

export default Item
