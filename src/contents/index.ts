import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["http://*/*", "https://*/*"],
  all_frames: true
}

let startNode = null
let endNode = null
let selectedText = ""

document.addEventListener("click", function (event) {
  // console.log(event)
  // if (event.target.id == "copyStartingIcon") return
  // if (event.target.id == "copyEndingIcon") return
  chrome.storage.local.get("isOn", function (result) {
    if (
      result.isOn == ("true" || true) &&
      result.isOn != "false" &&
      event.altKey
    ) {
      if (!startNode) {
        console.log("start")
        addStartIcon(event.clientX, event.clientY, event.pageX, event.pageY)
      } else if (startNode) {
        console.log("end")
        endNode = findTextNodeFromPoint(event.clientX, event.clientY)

        selectTextBetween()
        setTimeout(() => {
          addEndIcon(event.clientX, event.clientY, event.pageX, event.pageY)
        }, 100)
      }
    }
  })
})

function addStartIcon(x: any, y: any, pageX: any, pageY: any) {
  let endIcon = document.querySelector("#copyEndingIcon")
  if (endIcon) return
  let selectionIcons = document.querySelectorAll("#copyStartingIcon")
  if (selectionIcons)
    selectionIcons.forEach((selectionIcon) => selectionIcon.remove())
  let startIcon = document.createElement("span")
  startIcon.id = "copyStartingIcon"

  // startIcon.style.padding = "5px"
  // startIcon.style.borderRadius = "6px"
  startIcon.textContent = "["
  startIcon.style.position = "absolute"
  startIcon.style.zIndex = "99999999999999"
  startIcon.style.backgroundColor = ""
  startIcon.style.color = "red"
  startIcon.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  startIcon.style.cursor = "pointer"
  startIcon.style.left = `${pageX}px`
  startIcon.style.top = `${pageY}px`
  // document.body.appendChild(startIcon)

  startIcon.remove()
  startNode = findTextNodeFromPoint(x, y)
  startIcon.onclick = async () => {
    // console.log({ startNode })
  }
}

async function addEndIcon(x: any, y: any, pageX: any, pageY: any) {
  let selectionIcons = document.querySelectorAll("#copyEndingIcon")
  if (selectionIcons)
    selectionIcons.forEach((selectionIcon) => selectionIcon.remove())

  let endIcon = document.createElement("span")
  endIcon.id = "copyEndingIcon"
  endIcon.style.padding = "5px 12px"
  endIcon.style.borderRadius = "6px"
  endIcon.textContent = "Copy"
  endIcon.style.position = "absolute"
  endIcon.style.zIndex = "99999999999999"
  endIcon.style.backgroundColor = "black"
  endIcon.style.color = "white"
  endIcon.style.transition = "opacity 0.3s ease, transform 0.3s ease"
  endIcon.style.cursor = "pointer"
  endIcon.style.left = `${pageX}px`
  endIcon.style.top = `${pageY}px`
  // document.body.appendChild(endIcon)

  // endIcon.onclick = async () => {
  //   // endNode = findTextNodeFromPoint(x, y)
  //   // selectTextBetween()
  //   startNode = null
  //   endNode = null
  //   chrome.storage.local.get(["recentlyCopiedItems"], async (result) => {
  //     let items = result?.recentlyCopiedItems || "[]"
  //     items = Array.from(JSON.parse(items))
  //     if (selectedText === "") return
  //     items.unshift(selectedText)
  //     items = items.length > 10 ? items.slice(0, 10) : items
  //     await chrome.storage.local.set({
  //       recentlyCopiedItems: JSON.stringify(items)
  //     })
  //   })
  //   removeIcons()
  // }

  startNode = null
  endNode = null
  chrome.storage.local.get(["recentlyCopiedItems"], async (result) => {
    let items = result?.recentlyCopiedItems || "[]"
    items = Array.from(JSON.parse(items))
    if (selectedText === "") return
    items.unshift(selectedText)
    items = items.length > 10 ? items.slice(0, 10) : items
    await chrome.storage.local.set({
      recentlyCopiedItems: JSON.stringify(items)
    })
    await navigator.clipboard.writeText(selectedText)
    alert("Text successfully copied and stored!")
  })
}

function removeIcons() {
  document.getElementById("copyStartingIcon")?.remove()
  document.getElementById("copyEndingIcon")?.remove()
}

function findTextNodeFromPoint(x: any, y: any) {
  const elem = document.elementsFromPoint(x, y)
  // console.log({ elem })
  if (!elem) {
    return null
  }

  const walker = document.createTreeWalker(elem[0], NodeFilter.SHOW_TEXT, null)
  let foundNode = null
  let node: any = walker.nextNode() // Ensure correct initialization
  let nearestFirstNode = null
  let nearestLastNode = null
  do {
    const range = document.createRange()
    range.selectNodeContents(node)

    // Check if range covers the click point relative to the element
    const rects = range.getClientRects() // Assuming single text node per rect
    if (rects.length > 0) {
      if (!nearestFirstNode) {
        nearestFirstNode = node
      }
      nearestLastNode = node
    }
    // console.log({ rects, x, y, node })
    for (const rect of rects) {
      if (
        x >= rect?.left &&
        x <= rect?.right &&
        y >= rect?.top &&
        y <= rect?.bottom
        // true
      ) {
        const offset = getTextOffsetInNode(range, x, y)
        foundNode = { node, offset }
        return foundNode
        break
      }
    }
  } while ((node = walker.nextNode()))

  if (!startNode) {
    return { node: nearestFirstNode, offset: 0 }
  } else {
    return { node: nearestLastNode, offset: nearestLastNode.length }
  }
}

function getTextOffsetInNode(range: any, x: any, y: any) {
  const length = range.endOffset
  for (let i = 0; i < length; i++) {
    range.setStart(range.startContainer, i)
    range.setEnd(range.startContainer, i + 1)
    const rect = range.getBoundingClientRect()
    // console.log(rect)

    if (
      x >= rect?.left &&
      x <= rect?.right &&
      y >= rect?.top &&
      y <= rect?.bottom
    ) {
      return i
    } else {
      // console.log("not found")
    }
  }

  return 0
}

function selectTextBetween() {
  const range = document.createRange()
  const selection = window.getSelection()
  selection.removeAllRanges() // Clear existing selections

  // console.log({ startNode, endNode })
  if (startNode && endNode && startNode.node && endNode.node) {
    const startDomNode = startNode.node
    const endDomNode = endNode.node
    // console.log({ startDomNode, endDomNode })

    // Determine the correct document order
    const documentOrder = startDomNode.compareDocumentPosition(endDomNode)
    // console.log({ documentOrder })
    const isStartBeforeEnd =
      documentOrder == Node.DOCUMENT_POSITION_FOLLOWING ||
      (documentOrder == 0 && startNode.offset < endNode.offset) ||
      // (documentOrder == 2 && startNode.offset < endNode.offset) ||
      (documentOrder == 20 && startNode.offset < endNode.offset)

    if (isStartBeforeEnd) {
      range.setStart(startDomNode, startNode.offset)
      range.setEnd(endDomNode, endNode.offset)
    } else {
      range.setStart(endDomNode, endNode.offset)
      range.setEnd(startDomNode, startNode.offset)
    }
    console.log({ range })
    selection.addRange(range) // Add the new range to the current selection
    selectedText = range.toString()
    // console.log(selection.toString())
  } else {
    console.log("Invalid start or end node for selection")
  }
}
