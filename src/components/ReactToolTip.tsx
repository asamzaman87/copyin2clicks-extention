import { Tooltip } from 'react-tooltip'

interface IReactToolTip {
    text: string;
    anchorSelect: string;
    clickable?: boolean
}

export default function ReactToolTip({ text, anchorSelect, clickable = true }: IReactToolTip) {
    return (
        <>
            <Tooltip className="active:scale-95" anchorSelect={`#${anchorSelect}`} clickable={clickable}>
                {text}
            </Tooltip>
        </>
    )
}