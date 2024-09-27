import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import Container from "~components/Container";
import Footer from "~components/Footer";
import Header from "~components/Header";
import Tooltip from "~components/Tooltip";
import "~style.css";

interface userData {
  stripeSubscriptionId?: string;
  email?: string;
}

function IndexPopup() {
  const storage = new Storage({ area: "local" });
  const [error, setError] = useState(null);
  const [alert, setAlert] = useStorage({ key: "alert", instance: storage }, "");
  const [userData, setUserData] = useState<userData | []>([]);
  const [text, setText] = useState("Alt/Option");
  const [lastLoggedInUser, setLastLoggdInUser] = useStorage({
    key: "lastLoggedInUser",
    instance: new Storage({ area: "local" }),
  });

  const [selectedKeyCombination, setSelectedKeyCombination] = useStorage(
    { key: "key", instance: new Storage({ area: "local" }) },
    "altKey"
  );

  const getUserDataFromStorage = async () => {
    chrome.runtime.sendMessage({ action: "fetchUserData" }, (result) => {
      return result;
    })
    //Call API
    // return new Promise((resolve, reject) => {
    //   chrome.storage.sync.get("userData", (result) => {
    //     if (chrome.runtime.lastError) {
    //       console.error(chrome.runtime.lastError.message);
    //       reject(chrome.runtime.lastError);
    //     } else {
    //       resolve(result.userData);
    //     }
    //   });
    // });
  };

  const fetchUserData = async () => {
    try {
      const userData = await getUserDataFromStorage();
      if (userData) {
        setUserData(userData);
        if (userData?.email) {
          setLastLoggdInUser(userData?.email);
        }
      } else {
        throw new Error("No userData found");
      }
    } catch (storageError) {
      chrome.runtime.sendMessage({ action: "fetchUserData" }, (response) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          setUserData(null);
        } else if (response.error) {
          setError(response.error);
          setUserData(null);
        } else {
          setError(null);
          setUserData(response);
          setLastLoggdInUser(response?.email);
          chrome.storage.sync.set({ userData: response });
          console.log("res", response);
        }
      });
    }
  };

  useEffect(() => {
    setAlert("");
    fetchUserData();

    const handleStorageChange = (changes, areaName) => {
      if (areaName === "sync" && changes.userData) {
        setUserData(changes.userData.newValue);
      }
    };
    chrome.storage.sync.get("userData", (result) => {
      setUserData(result.userData || {});
    });
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleKeyCombinationChange = (e) => {
    setSelectedKeyCombination(e.target.value);
  };

  useEffect(() => {
    if (selectedKeyCombination === "altKey") {
      setText("Alt/Option");
    } else if (selectedKeyCombination === "metaKey") {
      setText("Command/Window");
    }
  }, [selectedKeyCombination]);

  return (
    <>
      <div className="w-[450px] min-h-[300px] max-h-[450px] flex flex-col justify-between">
        <Header
          setLastLoggdInUser={setLastLoggdInUser}
          userData={userData}
          selectedKeyCombination={selectedKeyCombination}
          handleKeyCombinationChange={handleKeyCombinationChange}
        />
        <main className="p-2 flex-grow">
          <Container
            lastLoggedInUser={lastLoggedInUser}
            userData={userData}
            text={text}
          />
        </main>
        <Footer userData={userData} />
        {alert && <Tooltip text={alert} />}
      </div>
    </>
  );
}

export default IndexPopup;
