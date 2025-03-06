import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

import Container from "~components/Container";
import Footer from "~components/Footer";
import Header from "~components/Header";
import Tooltip from "~components/Tooltip";
import "~style.css";

function IndexPopup()
{
    const storage = new Storage({ area: "local" });
    const [error, setError] = useState(null);
    const [alert, setAlert] = useStorage({ key: "alert", instance: storage }, "");
    const [text, setText] = useState("Alt/Option");

    const [selectedKeyCombination, setSelectedKeyCombination] = useStorage(
        { key: "key", instance: new Storage({ area: "local" }) },
        "altKey"
    );

    useEffect(() =>
    {
        setAlert("");
    }, []);

    const handleKeyCombinationChange = (e) =>
    {
        setSelectedKeyCombination(e.target.value);
    };

    useEffect(() =>
    {
        if (selectedKeyCombination === "altKey")
        {
            setText("Alt/Option");
        } else if (selectedKeyCombination === "metaKey")
        {
            setText("Command/Window");
        }
    }, [selectedKeyCombination]);

    return (
        <>
            <div className="w-[450px] min-h-[300px] max-h-[450px] flex flex-col justify-between">
                <Header
                    selectedKeyCombination={selectedKeyCombination}
                    handleKeyCombinationChange={handleKeyCombinationChange}
                />
                <main className="p-2 flex-grow">
                    <Container
                        text={text}
                    />
                </main>
                <Footer />
                {alert && <Tooltip text={alert} />}
            </div>
        </>
    );
}

export default IndexPopup;
