import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { Dot, RectDots, ResizeType } from '../type';
import style from './flipSticker.scss';

let mousePress = { x: 0, y: 0 };
let initRotate = 0;
let initW = 0;
let initH = 0;
let initX = 0;
let initY = 0;
let newW = 0;
let newH = 0;
let newX = 0;
let newY = 0;

let resizeFromW = 1;
let resizeFromN = 1;
let resizeSetting = 0;
let imgOffset = { x: 0, y: 0 };
let bounceState = false;

const canvasDots: RectDots = {
    c1: { x: 0, y: 0 },
    c2: { x: 0, y: 0 },
    c3: { x: 0, y: 0 },
    c4: { x: 0, y: 0 },
};
const controlDots: RectDots = {
    i1: { x: 0, y: 0 },
    i2: { x: 0, y: 0 },
    i3: { x: 0, y: 0 },
    i4: { x: 0, y: 0 },
};

const Home: FunctionalComponent = () => {

    const [file, setFile] = useState("fliptesting");
    const [mvbBoxPos, setMvbBoxPos] = useState({ top: 400, left: 400 });
    const [center, setCenter] = useState({ x: 0, y: 0 });
    const [degree, setDegree] = useState(0);
    const [cActive, setCActive] = useState(false);

    const savePosOfCanvas = () => {
        const canvas = document.getElementById("canvas");
        if (canvas) {
            const canvPos = canvas.getBoundingClientRect();
            canvasDots.c1 = { x: canvPos.left, y: canvPos.top };
            canvasDots.c2 = { x: canvPos.right, y: canvPos.top };
            canvasDots.c3 = { x: canvPos.right, y: canvPos.bottom };
            canvasDots.c4 = { x: canvPos.left, y: canvPos.bottom };
        }
    };
    const cornArr = ["nw", "ne", "se", "sw"];

    const getPosOfControlDots = () => {
        for (let i = 0; i < cornArr.length; i++) {
            const dotRef = document.querySelector(`[data-id=${cornArr[i]}]`);
            if (dotRef) {
                const dotPos = dotRef.getBoundingClientRect();
                controlDots[`i${i + 1}`] = {
                    x: dotPos.left + (dotPos.width / 2),
                    y: dotPos.top + (dotPos.height / 2),
                };
            }
        }
    };
    const areLinesIntersected = (): boolean => {
        let isOut = false;
        for (let i = 1; i <= Object.keys(canvasDots).length; i++) {
            for (let j = 1; j <= Object.keys(controlDots).length; j++) {
                if (i === Object.keys(canvasDots).length) {
                    isOut = areDotsCollided(
                        canvasDots[`c${i}`],
                        canvasDots[`c${1}`],
                        controlDots[`i${j}`],
                        controlDots[`i${j + 1}`],
                    );
                    if (isOut) return isOut;
                    break;
                }
                if (j === Object.keys(controlDots).length) {
                    isOut = areDotsCollided(
                        canvasDots[`c${i}`],
                        canvasDots[`c${i + 1}`],
                        controlDots[`i${j}`],
                        controlDots[`i${1}`],
                    );
                    if (isOut) return isOut;
                    break;
                }
                isOut = areDotsCollided(
                    canvasDots[`c${i}`],
                    canvasDots[`c${i + 1}`],
                    controlDots[`i${j}`],
                    controlDots[`i${j + 1}`],
                );
                if (isOut) return isOut;
            }
        }
        return isOut;
    };
    const areDotsCollided = (p1: Dot, p2: Dot, p3: Dot, p4: Dot) => {

        if (Math.max(p1.x, p2.x) < Math.min(p3.x, p4.x)) return false;
        if (Math.min(p1.x, p2.x) > Math.max(p3.x, p4.x)) return false;
        if (Math.max(p1.y, p2.y) < Math.min(p3.y, p4.y)) return false;
        if (Math.min(p1.y, p2.y) > Math.max(p3.y, p4.y)) return false;

        let sign1 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
        let sign2 = (p2.x - p1.x) * (p4.y - p1.y) - (p4.x - p1.x) * (p2.y - p1.y);
        let sign3 = (p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y);
        let sign4 = (p4.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p4.y - p3.y);

        if (sign1 == 0 && sign2 == 0 && sign3 == 0 && sign4 == 0) return true;
        return sign1 * sign2 <= 0 && sign3 * sign4 <= 0;
    };
    const imgBounceValidation = () => {
        getPosOfControlDots();
        if (areControlDotsOutOfCanvas() && !areLinesIntersected()) bounceState = true;
        else bounceState = false;
    };
    const areControlDotsOutOfCanvas = (): boolean => {
        const sticker = document.getElementById("sticker");
        const canvas = document.getElementById("canvas");
        if (sticker && canvas) {
            const stkr = sticker.getBoundingClientRect();
            const canv = canvas.getBoundingClientRect();

            if (stkr.left < canv.left ||
                stkr.right > canv.right ||
                stkr.top < canv.top ||
                stkr.bottom > canv.bottom)
                return true;
        }
        return false;
    };

    const flipImg = () => {
        if (bounceState) {
            setMvbBoxPos({ left: 400, top: 400 });
            bounceState = false;
        }
    };

    useEffect(() => {
        setCenterOfMvbBox();
        window.addEventListener("mousedown", checkCursorPosition);
        return () => {
            window.removeEventListener("mousedown", checkCursorPosition);
        }
    }, []);
    useEffect(() => {
        setCenterOfMvbBox();
        setMvbBoxPos({ left: 400, top: 400 });
    }, [file]);
    useEffect(() => {
        // bounce 기능을 만들 때 튕긴 후에 중심이 안 잡혀서 추가. 
        //이렇게밖에 할 수 없나 고민중.ㅜ
        setCenterOfMvbBox();
    }, [mvbBoxPos]);
    const saveFileImg = (e: h.JSX.TargetedEvent<HTMLInputElement>) => {
        const fileList = (e.target as HTMLInputElement).files;
        if (fileList && fileList.length > 0) setFile(URL.createObjectURL(fileList[0]));
    };
    const checkCursorPosition = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const ctrBox = document.getElementById("controllerBox");
        if (ctrBox)
            if (!cActive && !ctrBox.contains(target)) setCActive(false);
    }, []);
    const dragStart = useCallback((e: MouseEvent) => {
        e.preventDefault();
        setMouseOffset(e);
        savePosOfCanvas();
        window.addEventListener("mousemove", movePosOfBox);
        window.addEventListener("mousemove", imgBounceValidation);
        window.addEventListener("mouseup", dragEnd);
        window.addEventListener("mouseup", flipImg);
    }, []);
    const movePosOfBox = useCallback((e: MouseEvent) => {
        const canvas = document.getElementById("canvas");
        if (canvas) {
            const canvasPos = canvas.getBoundingClientRect();
            let x = e.clientX - canvasPos.left - imgOffset.x;
            let y = e.clientY - canvasPos.top - imgOffset.y;
            setMvbBoxPos({ left: x, top: y });
        }
    }, []);
    const dragEnd = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        setCenterOfMvbBox();
        window.removeEventListener("mousemove", movePosOfBox);
        window.removeEventListener("mouseup", dragEnd);
    }, []);
    const setMouseOffset = (e: MouseEvent) => {
        const i = document.getElementById("mouseOffset");
        if (i) {
            const offset = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - offset.left);
            imgOffset.y = Math.round(e.clientY - offset.top);
        }
    }
    const setCenterOfMvbBox = () => {
        const mvbBox = document.getElementById("moveableBox");
        if (mvbBox) {
            const mvbPos = mvbBox.getBoundingClientRect();
            const center = {
                x: mvbPos.left + mvbPos.width / 2,
                y: mvbPos.top + mvbPos.height / 2,
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
    const initRad = initRotate * Math.PI / 180;
    const cosFraction = Math.cos(initRad);
    const sinFraction = Math.sin(initRad);

    const setResizeType = (controlId: string) => {
        if (controlId === "e" || controlId === "w") resizeSetting = ResizeType.horiz;
        else if (controlId === "s" || controlId === "n") resizeSetting = ResizeType.vertcl;
        else resizeSetting = ResizeType.corner;
    };
    const inspectNorthWest = (controlId: string) => {
        if (controlId.indexOf("w") > -1) resizeFromW = -1;
        if (controlId.indexOf("n") > -1) resizeFromN = -1;
    };
    const resizeStart = (e: MouseEvent, r?: string) => {
        e.preventDefault();
        const controlDataId = (e.currentTarget as Element).getAttribute("data-id");
        const mvbBox = document.getElementById("moveableBox");
        mousePress = { x: e.clientX, y: e.clientY };

        if (controlDataId) {
            setResizeType(controlDataId);
            inspectNorthWest(controlDataId);
        }
        if (mvbBox) {
            initW = mvbBox.offsetWidth;
            initH = mvbBox.offsetHeight;
            initX = mvbBox.offsetLeft;
            initY = mvbBox.offsetTop;
        }
        window.addEventListener("mousemove", resizeSticker);
        window.addEventListener("mouseup", resizeEnd);
    };
    const resetDiffVariables = () => {
        resizeFromW = 1;
        resizeFromN = 1;
    };
    const calByResizeType = (resizeSetting: ResizeType, rotatedWDiff: number, rotatedHDiff: number) => {
        const calWidth = initW + rotatedWDiff * resizeFromW;
        const calHeight = initH + rotatedHDiff * resizeFromN;

        const horiz = {
            calX: 0.5 * rotatedWDiff * cosFraction,
            calY: 0.5 * rotatedWDiff * sinFraction
        };

        const vertcl = {
            calX: 0.5 * rotatedHDiff * sinFraction * -1,
            calY: 0.5 * rotatedHDiff * cosFraction,
        };

        if (resizeSetting === ResizeType.horiz) {
            newW = calWidth;
            newX = newX + horiz.calX;
            newY = newY + horiz.calY;
        } else if (resizeSetting === ResizeType.vertcl) {
            newH = calHeight;
            newX = newX + vertcl.calX;
            newY = newY + vertcl.calY;
        } else {
            newW = calWidth;
            newH = calHeight;
            newX = newX + horiz.calX + vertcl.calX;
            newY = newY + horiz.calY + vertcl.calY;
        }
    };
    const repositMvbBox = (mvbBoxRef: HTMLElement) => {
        mvbBoxRef.style.width = newW + "px";
        mvbBoxRef.style.height = newH + "px";

        const ctrBox = document.getElementById("controllerBox");
        if (ctrBox) {
            ctrBox.style.width = newW + "px";
            ctrBox.style.height = newH + "px";
        }
        setMvbBoxPos({ left: newX, top: newY });
        setCenterOfMvbBox();
    };
    const resizeSticker = (e: MouseEvent) => {
        const mvbBox = document.getElementById("moveableBox");
        const wDiff = e.clientX - mousePress.x;
        const hDiff = e.clientY - mousePress.y;
        const rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
        const rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

        newW = initW;
        newH = initH;
        newX = initX;
        newY = initY;

        calByResizeType(resizeSetting, rotatedWDiff, rotatedHDiff);

        if (mvbBox) {
            repositMvbBox(mvbBox);
            //test
            if (newW < 0) {
                // resizeSetting horiz: 0, vertl: 1, corner: 2
                /**
                 * resizeFromW = -1이면 west
                 * resizeFromN = -1이면 north
                 */

                // W를 기준으로 크기를 조정할떄
                // newW 가 0 보다 작아지거나 0이되면 이제 E방향으로 이벤트가 발생하면됩니다.
                // 이유는 현재 위치에서 왼쪽 축을기준으로 오른쪽방향으로 커져야하기때문에

            }
        }
    };

    const resizeEnd = () => {
        resetDiffVariables();
        window.removeEventListener("mousemove", resizeSticker);
        window.removeEventListener("mouseup", resizeEnd);
    };
    const ctrArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];
    const ctrElems = ctrArray.map((dir, idx) => {
        return <div key={`control-${idx}`}
            class={style.resizeControl}
            data-id={`${dir}`}
            onMouseDown={(e) => resizeStart(e)}
        />;
    });
    const setFileSizeToSticker = (e: h.JSX.TargetedEvent<HTMLImageElement>) => {
        const fileImg = e.currentTarget as HTMLImageElement;

        const stickerMaxWidth = 500;
        const stickerMaxHeight = 281.5;
        const fileInitW = fileImg.naturalWidth;
        const fileInitH = fileImg.naturalHeight;
        let fileNewW = 0;
        let fileNewH = 0;

        const mvbBox = document.getElementById("moveableBox");
        const ctrBox = document.getElementById("controllerBox");

        if (mvbBox && ctrBox) {
            if (fileInitW > stickerMaxWidth) {
                fileNewW = stickerMaxWidth;
                fileNewH = stickerMaxWidth * fileInitH / fileInitW;
            }
            if (fileInitH > stickerMaxHeight) {
                fileNewW = stickerMaxHeight * fileInitW / fileInitH;
                fileNewH = stickerMaxHeight;
            }
            mvbBox.style.width = fileNewW + "px";
            mvbBox.style.height = fileNewH + "px";
            ctrBox.style.width = fileNewW + "px";
            ctrBox.style.height = fileNewH + "px";
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
                            left: mvbBoxPos.left,
                            top: mvbBoxPos.top,
                            transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                            display: cActive ? "block" : "none",
                            width: 500,
                            height: 280,
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
                            {ctrElems}
                        </div>
                    </div>
                </div>
                <div
                    id="canvas"
                    class={style.canvas}
                >
                    {file && <>
                        <div
                            id="mouseOffset"
                            class={style.cursorHelper}
                            style={{
                                left: mvbBoxPos.left,
                                top: mvbBoxPos.top,
                            }}
                        />
                        <div class={style.moveableBoxWrapper}>
                            <div
                                id="moveableBox"
                                class={style.stickerBox}
                                style={{
                                    left: mvbBoxPos.left,
                                    top: mvbBoxPos.top,
                                    transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                                    width: 500,
                                    height: 281,
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
                                    src="https://i.ytimg.com/vi/JVzwiFKfLEU/hq720_live.jpg?sqp=CMDd4JAG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC98d0XVx3vMyvPP_CHzugjSeiGkQ"
                                    // src={file}
                                    onLoad={(e) => {
                                        setFileSizeToSticker(e);
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
