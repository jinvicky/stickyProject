import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './flipSticker.scss';

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


//
let rx = 1;
let rx2 = -1;
let ry = 1;

let rw = 1;
let rh = 1;


enum ResizeType { horizt, vertcl, corner }

let resizeSetting = 0;



let imgOffset = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [file, setFile] = useState("");

    const saveFileImg = (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) setFile(URL.createObjectURL(target.files[0]));
    };

    const [boxPos, setBoxPos] = useState({ top: 500, left: 500 });
    const [cActive, setCActive] = useState(false);

    useEffect(() => {
        setCenterOfBox();
        window.addEventListener("mousedown", checkCursorPosition);
        return () => {
            window.removeEventListener("mousedown", checkCursorPosition);
        }
    }, []);

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

    const setResizeType = (controlId: string) => {
        if (controlId === "e" || controlId === "w") resizeSetting = ResizeType.horizt;
        else if (controlId === "s" || controlId === "n") resizeSetting = ResizeType.vertcl;
        else resizeSetting = ResizeType.corner;
    };

    const inspectNorthWest = (controlId: string) => {

        if (controlId.indexOf("n") > -1) rh = -1;
        if (controlId.indexOf("w") > -1) rw = -1;
    };

    const resizeStart = (e: MouseEvent, r?: string) => {
        e.preventDefault();
        const controlDataId = (e.currentTarget as Element).getAttribute("data-id");

        if (controlDataId) {
            setResizeType(controlDataId);
            inspectNorthWest(controlDataId);
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

    const calWidAndPos = (rotatedWDiff: number) => {
        newW = initW + rotatedWDiff * rw;
        newX = newX + 0.5 * rotatedWDiff * cosFraction * rx;
        newY = newY + 0.5 * rotatedWDiff * sinFraction * ry;
    };

    const calculateNewY = (rotatedHDiff: number) => {
        newH = initH + rotatedHDiff * rh;
        rx = -1;
        newX = newX + 0.5 * rotatedHDiff * sinFraction * rx;
        newY = newY + 0.5 * rotatedHDiff * cosFraction * ry;
    };

    const calculateEdge = (rotatedWDiff: number, rotatedHDiff: number) => {
        newW = initW + rotatedWDiff * rw;
        newH = initH + rotatedHDiff * rh;

        newX = (newX + 0.5 * rotatedWDiff * cosFraction * rx)
            + (0.5 * rotatedHDiff * sinFraction * rx2);

        newY = (newY + 0.5 * rotatedWDiff * sinFraction * ry)
            + (0.5 * rotatedHDiff * cosFraction * ry);

    };

    const [scaleX, setScaleX] = useState(1);

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

        if (resizeSetting === ResizeType.horizt) calWidAndPos(rotatedWDiff);
        else if (resizeSetting === ResizeType.vertcl) calculateNewY(rotatedHDiff);
        else if (resizeSetting === ResizeType.corner) calculateEdge(rotatedWDiff, rotatedHDiff);

        if (b) {
            repositBox(b);
            if (newW < 0) {
                if ("w") {
                    setResizeType("w");
                    inspectNorthWest("w");

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
                /**
                 * 
                 * checkDirection(dir), checkNW(dir) 이 두 함수를 
                 * 반대로 하면 되지 않느냐~~~
                 * 
                 * e를 w로 바꾸고 w를 e로 바꿔보자
                 * 
                 */
            }
        }
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
                    {file && <>
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
                                    transform: `translate(-50%, -50%)
                                    rotate(${degree}deg)
                                    scale( ${scaleX}, ${1})`,
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    if (!cActive) dragStart(e);
                                }}
                                onClick={() => setCActive(true)}
                            >
                                <img
                                    id="sticker"
                                    class={style.sticker}
                                    // src="https://i.ytimg.com/vi/JVzwiFKfLEU/hq720_live.jpg?sqp=CMDd4JAG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC98d0XVx3vMyvPP_CHzugjSeiGkQ"
                                    src={file}
                                    onLoad={(e) => {
                                        setStickerRatio(e);
                                        setCActive(true);
                                    }}
                                />
                            </div>
                        </div>
                    </>}
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
