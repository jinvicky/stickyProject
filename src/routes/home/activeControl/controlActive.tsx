import { createContext, Fragment, FunctionalComponent, h } from 'preact';
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


    const [drag, setDrag] = useState(false);

    const [tPos, setTPos] = useState({ left: 200, top: 200 });

    const [boxPos, setBoxPos] = useState({ top: 200, left: 200 });

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
            setTPos({ left: e.clientX - imgOffset.x, top: e.clientY - imgOffset.y });
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
        const point = document.getElementById("centerPoint");
        if (point) {
            const center = {
                x: point?.getBoundingClientRect().left + point?.getBoundingClientRect().width,
                y: point?.getBoundingClientRect().top + point?.getBoundingClientRect().height,
            };
            setCenter(center);
        }
    };

    useEffect(() => {
        setCenterOfBox();
    }, []);

    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        rotate && setDegree(Math.round(degree));
    };

    //DESC:: control mousedown시 시작하는 e.clientX,Y 저장
    const [resize, setResize] = useState({ direction: "", state: false });

    const [controller, setController] = useState(false);

    const checkDirection = (e: MouseEvent) => {

        const direction = (e.currentTarget as Element).getAttribute("data-id");
        if (direction) {
            if (direction === "e" || direction === "w")
                dir = "width";
            else if (direction === "s" || direction === "n")
                dir = "height";
            else dir = "edge";
        }
    };

    const checkNW = (e: MouseEvent) => {
        const direction = (e.currentTarget as Element).getAttribute("data-id");
        if (direction) {

            if (direction.indexOf("n") > -1)
                rh = -1;
            if (direction.indexOf("w") > -1)
                rw = -1;
        }
    }

    const controllerSetting = (e: MouseEvent) => {

        checkDirection(e);
        checkNW(e);

        mousePress = { x: e.clientX, y: e.clientY };

        const box = document.getElementById("moveableBox");
        if (box) {
            initW = box.offsetWidth;
            initH = box.offsetHeight;

            initX = box.offsetLeft;
            initY = box.offsetTop;

            initRotate = degree;
        }
        setController(true);
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


        //테스트 삼아서 #fakeControl의 width, height도 같이 변경해본다. 
        const f = document.getElementById("fakeControl");
        if (f) {
            f.style.width = newW + "px";
            f.style.height = newH + "px";
        }



        setBoxPos({ left: newX, top: newY });

        const canvas = document.getElementById("canvas");
        if (canvas) {
            const vasRect = canvas.getBoundingClientRect();
            setTPos({ left: newX + vasRect.left, top: newY + vasRect.top });
        }
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


        if (controller) {
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
                    resetRVariable();
                    setController(false);
                    setRotate(false);
                    setDrag(false);
                }}
            >
                <div id="fakeWrapper"
                    style={{
                        border: "1px solid yellow",
                        position: "absolute",
                        transformOrigin: "top left",
                    }}
                >
                    <div
                        id="fakeControl"
                        style={{
                            border: "1px solid blue",
                            position: "absolute",
                            left: tPos.left,
                            top: tPos.top,
                            display: "inline-block",
                            zIndex: 900,
                            width: 300,
                            height: 300,
                            transform: `translate(-50%, -50%) rotate(${degree}deg)`,

                        }}
                        onMouseDown={(e) => {
                            boxMouseDown(e);
                        }}
                        onMouseUp={() => {
                            boxMouseUp();
                        }}
                        onClick={() => console.log("fakeWrapper")}
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
                            {controlElems}
                        </div>
                    </div>
                </div>

                <div
                    id="canvas"
                    class={style.canvas}
                    style={{
                        overflow: "hidden"
                    }}
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
                                width: 300,
                                height: 300,
                                backgroundColor: "skyblue"

                            }}
                        >
                            <div
                                id="centerPoint"
                                class={style.centerPoint}
                            />
                            <img
                                id="img"
                                class={style.uploadImg}
                                draggable={false}
                                src="https://i.ytimg.com/vi/JVzwiFKfLEU/hq720_live.jpg?sqp=CMDd4JAG-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLC98d0XVx3vMyvPP_CHzugjSeiGkQ"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                }}
                                //issue: control active 상태와 이벤트가 겹치니까 오작동한다. 
                                // onMouseDown={(e) => {
                                //     boxMouseDown(e);
                                // }}
                                // onMouseUp={() => {
                                //     boxMouseUp();
                                // }}
                                onClick={() => console.log("stickerImg")}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div >
    </Fragment >
};

export default Home;
