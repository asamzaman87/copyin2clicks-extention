import React, { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import Item from "./Item"

function Container() {
  let [key, setKey] = useState("")
  const [recentlyCopiedItems, setRecentlyCopiedItems] = useStorage(
    {
      key: "recentlyCopiedItems",
      instance: new Storage({
        area: "local"
      })
    },
    []
  )
  useEffect(() => {
    let platform = navigator.platform
    if (platform.includes("Mac")) {
      setKey("Option")
    } else {
      setKey("Alt")
    }
  })

  return (
    <div className="flex flex-col">
      <h1 className="text-base font-bold">Recently Copied Items:</h1>
      <div className="p-1 flex flex-col gap-1.5 max-h-[300px] mt-2 mb-2  overflow-auto">
        {recentlyCopiedItems.map((item) => (
          <Item text={item} key={item + Math.random()} />
        ))}
        {recentlyCopiedItems.length === 0 && (
          <p className="text-base font-semibold text-center text-gray-500 mt-1">
            To start: press "{key}" key on your keyboard and click where you
            want to start from. Then move your mouse to the last letter you want
            copied press "{key}" and click again, text will be copied.
          </p>
        )}
      </div>
    </div>
  )
}

export default Container
