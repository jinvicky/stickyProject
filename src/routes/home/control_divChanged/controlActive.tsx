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
    const saveFileImg = (files: FileList) => files && setFile(URL.createObjectURL(files[0]));

    const [drag, setDrag] = useState(false);
    const [boxPos, setBoxPos] = useState({ top: 200, left: 200 });

    useEffect(() => {
        console.log("mounted");
        setCenterOfBox();
        window.addEventListener("click", checkETarget);
        return () => {
            window.removeEventListener("click", checkETarget);
            console.log("unmounted");
        }
    }, []);

    useEffect(() => {
        setBoxPos({ left: 100, top: 100 });
    }, [file]);


    const checkETarget = useCallback((e: MouseEvent) => {

    }, []);

    const boxMouseDown = useCallback((e: MouseEvent) => {
        setDrag(true);
        setImgOffset(e);

        window.addEventListener("mousemove", movePosOfBox);
        window.addEventListener("mouseup", boxMouseUp);
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

    const boxMouseUp = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        setDrag(false);
        setCenterOfBox();

        window.removeEventListener("mousemove", movePosOfBox);
        window.removeEventListener("mouseup", boxMouseUp);
    }, []);

    const [cActive, setCActive] = useState(false);

    const setImgOffset = (e: MouseEvent) => {
        const i = document.getElementById("cursorHelper");
        if (i) {
            const img = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - img.left);
            imgOffset.y = Math.round(e.clientY - img.top);
        }
    }

    const [rotate, setRotate] = useState(false);
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

    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        rotate && setDegree(Math.round(degree));
    };

    const [resize, setResize] = useState(false);

    const checkDirection = (direction: string) => {
        if (direction === "e" || direction === "w") dir = "width";
        else if (direction === "s" || direction === "n") dir = "height";
        else dir = "edge";
    };

    const checkNW = (direction: string) => {
        if (direction.indexOf("n") > -1) rh = -1;
        if (direction.indexOf("w") > -1) rw = -1;
    };

    const controllerSetting = (e: MouseEvent) => {
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

            initRotate = degree;
        }
        setResize(true);
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

    const resizeBox = (e: MouseEvent) => {
        const b = document.getElementById("moveableBox");

        let wDiff = e.clientX - mousePress.x;
        let hDiff = e.clientY - mousePress.y;

        const rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
        const rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

        newW = initW;
        newH = initH;
        newX = initX;
        newY = initY;


        if (resize) {
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
        }
    };

    const controlArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];

    const controlElems = controlArray.map((direction2, idx) => {
        return <div key={idx}
            class={style.resizeControl}
            data-id={`${direction2}`}
            onMouseDown={(e) => controllerSetting(e)}
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

    return <Fragment>
        <div class={style.root}
            id="moveableSpace"
            onMouseMove={(e) => {
                if (drag) {
                    movePosOfBox(e);
                }
                resizeBox(e);
                rotateBox(e);
            }}
            onMouseUp={() => {
                resetRVariable();
                setResize(false);
                setRotate(false);
                setDrag(false);
            }}
        >
            <div
                class={style.screen}
            >
                <div
                    id="fakeWrapper"
                    class={style.controllerBoxWrapper}
                >
                    <div
                        id="controllerBox"
                        class={style.controllerBox}
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                            transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                            // display: cActive === true ? "block" : "none",
                            // display: block,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div
                                id="control"
                                class={style.rotateControl}
                                onMouseDown={() => {
                                    setRotate(true);
                                }}
                                onMouseUp={() => setRotate(false)}
                            />
                        </div>
                        <div id="draggableSpace"
                            class={style.draggableSpace}
                            onMouseDown={(e) => {
                                boxMouseDown(e);
                            }}
                            onMouseUp={(e) => {
                                boxMouseUp(e);
                            }}
                        />
                        <div
                            id="controlBox"
                            class={style.controlBox}
                        >
                            {controlElems}
                        </div>
                    </div>
                </div>

                <div
                    id="canvas"
                    class={style.canvas}
                    onClick={() => {
                        if (cActive) setCActive(!cActive);
                    }}
                >
                    {file && <>
                        <div
                            id="cursorHelper"
                            class={style.cursorHelper}
                            style={{
                                left: boxPos.left,
                                top: boxPos.top,
                            }}
                        />
                        <div id="boxWrapper"
                            class={style.moveableBoxWrapper}
                        >
                            <div
                                id="moveableBox"
                                class={style.stickerBox}
                                style={{
                                    left: boxPos.left,
                                    top: boxPos.top,
                                    transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                                }}
                            >
                                <img
                                    id="img"
                                    class={style.sticker}
                                    draggable={false}
                                    // src="https://i.ytimg.com/vi/JVzwiFKfLEU/hq720_live.jpg?sqp=CMDd4JAG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC98d0XVx3vMyvPP_CHzugjSeiGkQ"
                                    src={file}
                                    onLoad={(e) => setStickerRatio(e)}
                                    onMouseDown={(e) => {
                                        if (!cActive) boxMouseDown(e)
                                    }}
                                    onMouseUp={(e) => {
                                        if (!cActive) {
                                            boxMouseUp(e);
                                            // setCActive(true);
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation(); //canvas 방지
                                        // setCActive(true);
                                    }}
                                />
                            </div>
                        </div>
                    </>
                    }
                </div>
            </div>
            <input type="file"
                id="upload"
                class={style.uploadBtn}
                onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) saveFileImg(target.files);
                }}
            />
        </div >
    </Fragment >
};

export default Home;
