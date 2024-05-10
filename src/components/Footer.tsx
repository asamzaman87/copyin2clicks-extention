import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import Tooltip from "./Tooltip"

function Footer() {
  const [extension, setExtension] = useState("txt")

  const storage = new Storage({ area: "local" })
  let [txt, setTxt] = useStorage({ key: "extension", instance: storage }, "txt")
  const [toolTip, setToolTip] = useStorage(
    { key: "alert", instance: storage },
    ""
  )
  useEffect(() => {
    setExtension(txt)
  }, [txt])

  function setExtensionFunc(e: React.ChangeEvent<HTMLInputElement>) {
    setExtension(e.target.value)
  }
  function onSave() {
    setTxt(extension)
    handleAlert()
  }

  function handleAlert() {
    setToolTip(`File extension set to .${extension}!`)
    setTimeout(() => {
      setToolTip("")
    }, 1000)
  }

  return (
    <div className="p-2 pb-0 flex justify-center">
      <div className="flex gap-1 ">
        <input
          className="border-2 text-center text-sm font-semibold text-gray-500 border-gray-400 rounded-md p-2 w-24"
          type="text"
          value={extension}
          onChange={setExtensionFunc}
          placeholder="E.g. txt"
        />
        <button
          onClick={onSave}
          className="border-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-md p-2 cursor-pointer">
          Set File Extension
        </button>
      </div>
    </div>
  )
}

export default Footer
