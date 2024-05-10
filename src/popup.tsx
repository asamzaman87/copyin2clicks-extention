import { useEffect } from "react"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import Container from "~components/Container"
import Footer from "~components/Footer"
import Header from "~components/Header"
import Tooltip from "~components/Tooltip"

import "~style.css"

function IndexPopup() {
  const storage = new Storage({ area: "local" })
  const [alert, setAlert] = useStorage({ key: "alert", instance: storage }, "")
  useEffect(() => {
    setAlert("")
  }, [])

  return (
    <div className="w-[450px] min-h-[100px] max-h-[450px]">
      <Header />
      <main className="p-2">
        <Container />
        <Footer />
      </main>
      {alert && <Tooltip text={alert} />}
    </div>
  )
}

export default IndexPopup
