import React, { useState } from "react"
import { AiOutlineCloseCircle } from "react-icons/ai"
import { HiOutlineDocumentDownload } from "react-icons/hi"
import { IoMdOpen } from "react-icons/io"
import { MdContentCopy } from "react-icons/md"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import Tooltip from "./Tooltip"

function Actions({ text }) {
  const storage = new Storage({ area: "local" })
  let [extension] = useStorage({ key: "extension", instance: storage })
  // console.log({ extension })
  const [toolTip, setToolTip] = useStorage(
    { key: "alert", instance: storage },
    ""
  )

  async function onCopyToClipboard(text: string) {
    setToolTip("Copied!")
    setTimeout(() => {
      setToolTip("")
    }, 1000)
    navigator.clipboard.writeText(text)
  }

  function onDownload(text: string) {
    if (!extension) return
    const file = new Blob([text], { type: "text/plain" })
    console.log({ extension })
    chrome.downloads.download(
      {
        url: URL.createObjectURL(file),
        filename: `copyIn2Clicks.${extension}`
      },
      () => {
        setToolTip("Downloaded!")
        setTimeout(() => {
          setToolTip("")
        }, 1000)
      }
    )
  }

  function onOpenInNewTab(text: string) {
    const newWindow = window.open("Text", "_blank")
    newWindow.document.title = "CopyIn2Clicks"
    newWindow.document.write(
      '<pre style="font-size: 14px; white-space: pre-wrap;">' + text + "</pre>"
    )
  }

  function onRemove(text: string) {
    chrome.storage.local.get(["recentlyCopiedItems"], (result) => {
      let items = result.recentlyCopiedItems
      items = Array.from(JSON.parse(items))
      items = items.filter((item) => item !== text)
      chrome.storage.local.set({ recentlyCopiedItems: JSON.stringify(items) })
      setToolTip("Removed!")
      setTimeout(() => {
        setToolTip("")
      }, 1000)
    })
  }

  return (
    <div className="actions flex gap-0.5 self-end ">
      <MdContentCopy
        onClick={onCopyToClipboard.bind(this, text)}
        title="Copy"
        className="text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-100"
      />
      <HiOutlineDocumentDownload
        onClick={onDownload.bind(this, text)}
        title={extension ? "Download" : "Please set file extension!"}
        className={`text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100 ${!extension && "hover:scale-100 hover:cursor-default text-gray-400"}`}
      />
      <IoMdOpen
        onClick={onOpenInNewTab.bind(this, text)}
        title="Open in new Tab"
        className="text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
      />
      <AiOutlineCloseCircle
        onClick={onRemove.bind(this, text)}
        title="Remove"
        className="text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
      />
    </div>
  )
}

export default Actions
