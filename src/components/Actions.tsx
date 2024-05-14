import React from "react"
import { AiOutlineCloseCircle } from "react-icons/ai"
import { HiOutlineDocumentDownload } from "react-icons/hi"
import { IoMdOpen } from "react-icons/io"
import { MdContentCopy } from "react-icons/md"
import ReactToolTip from './ReactToolTip'
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

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
      <div>
        <MdContentCopy
          id="copy-ext-icon"
          onClick={onCopyToClipboard.bind(this, text)}
          className="text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-100"
        />
        <ReactToolTip text={"copy"} anchorSelect={"copy-ext-icon"} />
      </div>
      <div>
        <HiOutlineDocumentDownload
          onClick={onDownload.bind(this, text)}
          id="download-ext-icon"
          className={`text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100 ${!extension && "hover:scale-100 hover:cursor-default text-gray-400"}`}
        />
        <ReactToolTip text={extension ? "Download" : "Please set file extension!"} anchorSelect={"download-ext-icon"} />
      </div>
      <div>
        <IoMdOpen
          onClick={onOpenInNewTab.bind(this, text)}
          id="new-tab-ext-icon"
          className="text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
        />
        <ReactToolTip text={"Open in new Tab"} anchorSelect={"new-tab-ext-icon"} />
      </div>
      <div>
        <AiOutlineCloseCircle
          id="remove-ext-icon"
          onClick={onRemove.bind(this, text)}
          className="text-2xl cursor-pointer hover:scale-110  active:scale-95 transition-all duration-100"
        />
        <ReactToolTip text={"Remove"} anchorSelect={"remove-ext-icon"} />
      </div>
    </div>
  )
}

export default Actions
