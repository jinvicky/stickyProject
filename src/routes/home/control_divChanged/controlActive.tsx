import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './controlActive.scss';

let mousePress = { x: 0, y: 0 };
let initX = 0;
let initY = 0;
let newW = 0;
let newH = 0;
let newX = 0;
let newY = 0;
let initRotate = 0;
let initW = 0;
let initH = 0;

let rx = 1;
let rx2 = -1;
let ry = 1;

let rw = 1;
let rh = 1;

//resize할 때 방향을 정의합니다. 
let dir = "";

let imgOffset = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [file, setFile] = useState("");

    const saveFileImg = (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) setFile(URL.createObjectURL(target.files[0]));
    }

    const [boxPos, setBoxPos] = useState({ top: 500, left: 500 });

    useEffect(() => {
        setCenterOfBox();
        window.addEventListener("mousedown", checkCursorPosition);
        return () => {
            window.removeEventListener("mousedown", checkCursorPosition);
        }
    }, []);

    const [cActive, setCActive] = useState(false);

    useEffect(() => {
        setCenterOfBox();
        setBoxPos({ left: 500, top: 500 });
    }, [file]);

    const checkCursorPosition = useCallback((e: MouseEvent) => {
        const tg = e.target as HTMLElement;
        const ControllerBox = document.getElementById("controllerBox");

        if (ControllerBox)
            if (!cActive && !ControllerBox.contains(tg))
                setCActive(false);
    }, []);

    const dragStart = useCallback((e: MouseEvent) => {
        e.preventDefault();
        setImgOffset(e);

        window.addEventListener("mousemove", movePosOfBox);
        window.addEventListener("mouseup", dragEnd);
    }, []);

    const movePosOfBox = useCallback((e: MouseEvent) => {

        const el = document.getElementById("canvas");
        if (el) {
            const elRect = el.getBoundingClientRect();
            let x = e.clientX - elRect.left - imgOffset.x;
            let y = e.clientY - elRect.top - imgOffset.y;

            setBoxPos({ left: x, top: y });
        }
    }, []);

    const dragEnd = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        setCenterOfBox();

        window.removeEventListener("mousemove", movePosOfBox);
        window.removeEventListener("mouseup", dragEnd);
    }, []);

    const setImgOffset = (e: MouseEvent) => {
        const i = document.getElementById("cursorPos");
        if (i) {
            const img = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - img.left);
            imgOffset.y = Math.round(e.clientY - img.top);
        }
    }

    const [degree, setDegree] = useState(0);
    const [center, setCenter] = useState({ x: 0, y: 0 });

    const setCenterOfBox = () => {
        const b = document.getElementById("moveableBox");
        if (b) {
            const rect = b.getBoundingClientRect();
            const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };
            setCenter(center);
        }
    };

    const rotateStart = (e: MouseEvent) => {
        e.preventDefault();
        window.addEventListener("mousemove", rotateSticker);
        window.addEventListener("mouseup", rotateEnd);
    };

    const rotateSticker = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        setDegree(Math.round(degree));
        initRotate = Math.round(degree);
    };

    const rotateEnd = () => {
        window.removeEventListener("mousemove", rotateSticker);
        window.removeEventListener("mouseup", rotateEnd);
    };

    const checkDirection = (direction: string) => {

        if (direction === "e" || direction === "w") dir = "width";
        else if (direction === "s" || direction === "n") dir = "height";
        else dir = "edge";
    };

    const checkNW = (direction: string) => {

        if (direction.indexOf("n") > -1) rh = -1;
        if (direction.indexOf("w") > -1) rw = -1;
    };

    const resizeStart = (e: MouseEvent) => {

        e.preventDefault();
        const direction = (e.currentTarget as Element).getAttribute("data-id");

        if (direction) {
            checkDirection(direction);
            checkNW(direction);
        }

        mousePress = { x: e.clientX, y: e.clientY };

        const box = document.getElementById("moveableBox");
        if (box) {
            initW = box.offsetWidth;
            initH = box.offsetHeight;
            initX = box.offsetLeft;
            initY = box.offsetTop;
        }
        window.addEventListener("mousemove", resizeSticker);
        window.addEventListener("mouseup", resizeEnd);
    };

    //resize 종료 시 rx, rw, rh 값을 초기화. ry는 1로 변하지 않더라.
    const resetRVariable = () => {

        rx = 1;
        rw = 1;
        rh = 1;
    };

    const calculateNewX = (WDiff: number) => {
        newW = initW + WDiff * rw;
        newX = newX + 0.5 * WDiff * cosFraction * rx;
        newY = newY + 0.5 * WDiff * sinFraction * ry;
    };

    const calculateNewY = (HDiff: number) => {
        newH = initH + HDiff * rh;
        rx = -1;
        newX = newX + 0.5 * HDiff * sinFraction * rx;
        newY = newY + 0.5 * HDiff * cosFraction * ry;
    };

    const calculateEdge = (rotatedWDiff: number, rotatedHDiff: number) => {

        newW = initW + rotatedWDiff * rw;
        newH = initH + rotatedHDiff * rh;

        newX = (newX + 0.5 * rotatedWDiff * cosFraction * rx)
            + (0.5 * rotatedHDiff * sinFraction * rx2);

        newY = (newY + 0.5 * rotatedWDiff * sinFraction * ry)
            + (0.5 * rotatedHDiff * cosFraction * ry);

    };

    const repositBox = (b: HTMLElement) => {
        b.style.width = newW + "px";
        b.style.height = newH + "px";

        const c = document.getElementById("controllerBox");
        if (c) {
            c.style.width = newW + "px";
            c.style.height = newH + "px";
        }

        setBoxPos({ left: newX, top: newY });
        setCenterOfBox();
    };

    const initRad = initRotate * Math.PI / 180;
    const cosFraction = Math.cos(initRad);
    const sinFraction = Math.sin(initRad);

    const resizeSticker = (e: MouseEvent) => {
        const b = document.getElementById("moveableBox");

        let wDiff = e.clientX - mousePress.x;
        let hDiff = e.clientY - mousePress.y;

        const rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
        const rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

        newW = initW;
        newH = initH;
        newX = initX;
        newY = initY;

        switch (dir) {
            case "width":
                calculateNewX(rotatedWDiff);
                break;
            case "height":
                calculateNewY(rotatedHDiff);
                break;
            case "edge":
                calculateEdge(rotatedWDiff, rotatedHDiff);
        }
        if (b) repositBox(b);
    };

    const resizeEnd = () => {
        resetRVariable();
        window.removeEventListener("mousemove", resizeSticker);
        window.removeEventListener("mouseup", resizeEnd);
    };

    const controlArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];

    const controlElems = controlArray.map((dir, idx) => {
        return <div key={`control-${idx}`}
            class={style.resizeControl}
            data-id={`${dir}`}
            onMouseDown={(e) => resizeStart(e)}
        />;
    });

    const setStickerRatio = (e: h.JSX.TargetedEvent<HTMLImageElement>) => {

        const img = e.currentTarget as HTMLImageElement;

        let sW = 500;
        let sH = 281.5;

        let iW = 0;
        let iH = 0;

        const b = document.getElementById("moveableBox");
        const c = document.getElementById("controllerBox");
        if (b && c) {
            if (img.naturalWidth > sW) {
                iW = sW;
                iH = sW * img.naturalHeight / img.naturalWidth;
            }
            if (img.naturalHeight > sH) {
                iW = sH * img.naturalWidth / img.naturalHeight;
                iH = sH;
            }
            b.style.width = iW + "px";
            b.style.height = iH + "px";
            c.style.width = iW + "px";
            c.style.height = iH + "px";
        }
    };

    return <>
        <div class={style.root}>
            <div class={style.screen}>
                {/* TODO:: controller active  */}
                {/* <div class={style.controlScreen} /> */}
                <div class={style.controllerBoxWrapper}>
                    <div
                        id="controllerBox"
                        class={style.controllerBox}
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                            transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                            display: cActive ? "block" : "none"
                        }}
                    >
                        <div class={style.targetLine}>
                            <div
                                class={style.rotateControl}
                                onMouseDown={(e) => rotateStart(e)}
                            />
                        </div>
                        <div
                            class={style.draggableSpace}
                            onMouseDown={(e) => dragStart(e)}
                        />
                        <div class={style.controlBox}>
                            {controlElems}
                        </div>
                    </div>
                </div>
                <div
                    id="canvas"
                    class={style.canvas}
                >
                    {/* {file && <> */}
                    <div
                        id="cursorPos"
                        class={style.cursorHelper}
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                        }}
                    />
                    <div class={style.moveableBoxWrapper}>
                        <div
                            id="moveableBox"
                            class={style.stickerBox}
                            style={{
                                left: boxPos.left,
                                top: boxPos.top,
                                transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                if (!cActive) dragStart(e);
                            }}
                            onClick={() => setCActive(true)}
                        >
                            <img
                                class={style.sticker}
                                src="https://i.ytimg.com/vi/JVzwiFKfLEU/hq720_live.jpg?sqp=CMDd4JAG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC98d0XVx3vMyvPP_CHzugjSeiGkQ"
                                // src={file}
                                onLoad={(e) => {
                                    setStickerRatio(e);
                                    setCActive(true);
                                }}
                            />
                        </div>
                    </div>
                    {/* </>} */}
                </div>
            </div>
            <input
                type="file"
                class={style.uploadBtn}
                onInput={(e) => saveFileImg(e)}
            />
        </div >
    </>
};

export default Home;
