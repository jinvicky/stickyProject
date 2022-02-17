import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './styleTest.scss';

let mousePress = { x: 0, y: 0 };
let initX = 0;
let initY = 0;
let newW, newH;
let newX = 0;
let newY = 0;
let initRotate = 0;
let initW = 0;
let initH = 0;

let imgOffset = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [drag, setDrag] = useState(false);
    const [boxPos, setBoxPos] = useState({ top: 100, left: 100 });

    //DESC:: .boxWrapper를 mousedown할 때 실행하는 함수. 
    const boxMouseDown = (e: any) => {
        setDrag(true);
        setImgOffset(e);
    };

    //DESC:: 이미지의 offset을 지정하는 함수 
    const setImgOffset = (e: MouseEvent) => {
        const i = document.getElementById("cursorHelper");
        if (i) {
            const img = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - img.left);
            imgOffset.y = Math.round(e.clientY - img.top);
        }
    }

    //DESC:: #moveableSpace에서 onMouseMove시 실행하는 함수.
    const movePosOfBox = useCallback((e: MouseEvent) => {

        const el = document.getElementById("canvas");
        if (el) {
            const elRect = el.getBoundingClientRect();
            let x = e.clientX - elRect.left - imgOffset.x;
            let y = e.clientY - elRect.top - imgOffset.y;

            setBoxPos({ left: x, top: y });
        }
    }, []);

    // .boxWrapper를 onMouseUp했을 때 실행 함수 
    const boxMouseUp = () => {
        setDrag(false);
        setCenterOfBox();
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

    useEffect(() => {
        setCenterOfBox()
    }, []);

    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        rotate && setDegree(Math.round(degree));
    };

    //DESC:: control mousedown시 시작하는 e.clientX,Y 저장
    const [prev, setPrev] = useState({ x: 0, y: 0 });
    const [resize, setResize] = useState({ direction: "e", state: false });


    const initRad = initRotate * Math.PI / 180;
    const cosFraction = Math.cos(initRad);
    const sinFraction = Math.sin(initRad);


    const resizeBox = (e: MouseEvent) => {
        const b = document.getElementById("moveableBox");
        const ch = document.getElementById("cursorHelper");

        let wDiff = e.clientX - mousePress.x;
        let hDiff = e.clientY - mousePress.y;

        const rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
        const rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

        newW = initW;
        newH = initH;
        newX = initX;
        newY = initY;

        if (b) {
            if (resize.state && resize.direction === "e") {
                newW = initW + rotatedWDiff; // not left;
                newX += 0.5 * rotatedWDiff * cosFraction;
                newY += 0.5 * rotatedWDiff * sinFraction;

                b.style.width = newW + "px";
                setBoxPos({ left: newX, top: newY });
                setCenterOfBox();
            } else if (resize.state && resize.direction === "w") {
                newW = initW - rotatedWDiff; // left;
                newX += 0.5 * rotatedWDiff * cosFraction;
                newY += 0.5 * rotatedWDiff * sinFraction;

                b.style.width = newW + "px";
                setBoxPos({ left: newX, top: newY });
                setCenterOfBox();
            } else if (resize.state && resize.direction === "n") {
                newH = initH - rotatedHDiff; // top; pb

                newX -= 0.5 * rotatedHDiff * sinFraction;
                newY += 0.5 * rotatedHDiff * cosFraction;

                b.style.height = newH + "px";
                setBoxPos({ left: newX, top: newY });
                setCenterOfBox();
            } else if (resize.state && resize.direction === "s") {
                newH = initH + rotatedHDiff; // not top;

                newX -= 0.5 * rotatedHDiff * sinFraction;
                newY += 0.5 * rotatedHDiff * cosFraction;

                b.style.height = newH + "px";
                setBoxPos({ left: newX, top: newY });
                setCenterOfBox();
            }
        }
    };



    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    if (drag) movePosOfBox(e);
                    resizeBox(e);
                    rotateBox(e);
                }}
                onMouseUp={() => {
                    setResize({ ...resize, state: false });
                    setRotate(false);
                    setDrag(false);
                }}
            >
                <div
                    id="canvas"
                    class={style.canvas}
                >
                    <div
                        id="cursorHelper"
                        class={style.cursorHelper}
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                        }}
                    ></div>
                    <div id="boxWrapper" style={{
                        border: "1px solid red",
                        position: "absolute",
                        transformOrigin: "top left",
                    }}>
                        <div
                            id="moveableBox"
                            class={style.moveableBox}
                            style={{
                                left: boxPos.left,
                                top: boxPos.top,
                                transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                                width: 100,
                                height: 100,
                                backgroundColor: "skyblue"

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
                            <div
                                id="controlBox"
                                class={style.controlBox}
                            >
                                <div
                                    id="east"
                                    class={style.resizeControl}
                                    data-id={"e"}
                                    onMouseDown={(e) => {
                                        setResize({ direction: "e", state: true });
                                        setPrev({ x: e.clientX, y: e.clientY });
                                        mousePress = { x: e.clientX, y: e.clientY };

                                        const box = document.getElementById("moveableBox");
                                        if (box) {
                                            initW = box.offsetWidth;
                                            initH = box.offsetHeight;

                                            initX = box.offsetLeft;
                                            initY = box.offsetTop;

                                            initRotate = degree;
                                        }
                                    }}
                                />
                                <div
                                    id="west"
                                    class={style.resizeControl}
                                    data-id={"w"}
                                    onMouseDown={(e) => {
                                        setResize({ direction: "w", state: true });
                                        setPrev({ x: e.clientX, y: e.clientY });
                                        mousePress = { x: e.clientX, y: e.clientY };

                                        const box = document.getElementById("moveableBox");
                                        if (box) {
                                            initW = box.offsetWidth;
                                            initH = box.offsetHeight;

                                            initX = box.offsetLeft;
                                            initY = box.offsetTop;

                                            initRotate = degree;
                                        }
                                    }}
                                />
                                <div
                                    id="north"
                                    class={style.resizeControl}
                                    data-id={"n"}
                                    onMouseDown={(e) => {
                                        setResize({ direction: "n", state: true });
                                        setPrev({ x: e.clientX, y: e.clientY });
                                        mousePress = { x: e.clientX, y: e.clientY };

                                        const box = document.getElementById("moveableBox");
                                        if (box) {
                                            initW = box.offsetWidth;
                                            initH = box.offsetHeight;

                                            initX = box.offsetLeft;
                                            initY = box.offsetTop;

                                            initRotate = degree;
                                        }
                                    }}
                                />
                                <div
                                    id="south"
                                    class={style.resizeControl}
                                    data-id={"s"}
                                    onMouseDown={(e) => {
                                        setResize({ direction: "s", state: true });
                                        setPrev({ x: e.clientX, y: e.clientY });
                                        mousePress = { x: e.clientX, y: e.clientY };

                                        const box = document.getElementById("moveableBox");
                                        if (box) {
                                            initW = box.offsetWidth;
                                            initH = box.offsetHeight;

                                            initX = box.offsetLeft;
                                            initY = box.offsetTop;

                                            initRotate = degree;
                                        }
                                    }}
                                />
                            </div>
                            <img
                                id="img"
                                class={style.uploadImg}
                                draggable={false}
                                // src={file}
                                src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                                tabIndex={-1}
                                style={{
                                    width: "100%",
                                    height: "100%"
                                }}
                                onMouseDown={(e) => {
                                    boxMouseDown(e);
                                }}
                                onMouseUp={() => {
                                    boxMouseUp();
                                }}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div >
    </Fragment >
};

export default Home;
