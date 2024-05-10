import React, { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

function Header() {
  const [isOn, setIsOn] = useStorage(
    { key: "isOn", instance: new Storage({ area: "local" }) },
    true
  )

  return (
    <div className="p-2 text-center text-2xl font-bold bg-slate-900 text-white">
      CopyIn2Clicks
      <div className="absolute right-1.5 top-2.5">
        <label className="switch">
          <input
            onChange={() => setIsOn(!isOn)}
            checked={isOn}
            type="checkbox"
            id="togBtn"
          />
          <div className="slider round"></div>
        </label>
      </div>
    </div>
  )
}

export default Header
