import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './styleTest.scss';

let imgOffset = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [degree, setDegree] = useState(40);
    const [center, setCenter] = useState({ x: 0, y: 0 });

    const [boxPos, setBoxPos] = useState({ top: 100, left: 100 });

    //DESC:: 이미지의 offset을 지정하는 함수 
    const setImgOffset = (e: MouseEvent) => {
        const i = document.getElementById("cursorHelper");
        if (i) {
            const img = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - img.left);
            imgOffset.y = Math.round(e.clientY - img.top);
        }
    }


    //DESC:: control mousedown시 시작하는 e.clientX,Y 저장
    const [prev, setPrev] = useState({ x: 0, y: 0 });
    const [resize, setResize] = useState({ direction: "one", state: false });

    const resizeBox = (e: MouseEvent) => {
        const b = document.getElementById("moveableBox");
        const ch = document.getElementById("cursorHelper");

        if (resize.state && resize.direction === "se") {
            if (b && ch) {
                b.style.width = b.offsetWidth - (prev.x - e.clientX) + "px";
                b.style.height = b.offsetHeight - (prev.y - e.clientY) + "px";
                ch.style.width = b.offsetWidth - (prev.x - e.clientX) + "px";
                ch.style.height = b.offsetHeight - (prev.y - e.clientY) + "px";
                setPrev({ x: e.clientX, y: e.clientY });
            }
        }
    };

    const resizeBox2 = (e: MouseEvent) => {
        const radians = degree * Math.PI / 180;
        const COS = Math.cos(radians);
        const SIN = Math.sin(radians);

        const box = document.getElementById("moveableBox");
        const boxHelper = document.getElementById("cursorHelper");

        let newW, newH, initW, initH, rotatedWDiff, rotatedHDiff;
        let wDiff = e.clientX - prev.x;
        let hDiff = e.clientY - prev.y;
        let newX = 0;
        let newY = 0;

        if (resize.state && resize.direction === "w") { //left
            if (box) {
                initW = box?.offsetWidth;
                initH = box?.offsetHeight;
                rotatedWDiff = COS * wDiff + SIN * hDiff;
                newW = initW - rotatedWDiff;
                newW = box && box.offsetWidth - (e.clientX - prev.x);
            }

            rotatedWDiff = COS * wDiff + SIN * hDiff;

            newX += 0.5 * rotatedWDiff * COS;
            newY += 0.5 * rotatedWDiff * SIN;

            if (box && boxHelper) {
                box.style.width = newW + "px";
                box.style.height = newH + "px";
                boxHelper.style.width = newW + "px";
                boxHelper.style.height = newH + "px";
                // ------------------------------------
                setBoxPos({ ...boxPos, left: boxPos.left + newX, });
                console.log("box pos test::: ", boxPos);
            }
            setPrev({ x: e.clientX, y: e.clientY });

        } else if (resize.state && resize.direction === "e") { //not left 
            initW = box?.offsetWidth;
            initH = box?.offsetHeight;
            rotatedWDiff = COS * wDiff + SIN * hDiff;
            rotatedWDiff = COS * wDiff + SIN * hDiff;

            newX += 0.5 * rotatedWDiff * COS;
            newY += 0.5 * rotatedWDiff * SIN;

            if (box && boxHelper) {
                box.style.width = newW + "px";
                box.style.height = newH + "px";
                boxHelper.style.width = newW + "px";
                boxHelper.style.height = newH + "px";
                // ------------------------------------
                setBoxPos({ ...boxPos, left: boxPos.left + newX, });
                console.log("box pos test::: ", box.style.width, box.style.height);
            }
            setPrev({ x: e.clientX, y: e.clientY });

        }
    };

    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    resizeBox(e);
                }}
                onMouseUp={() => {
                    setResize({ ...resize, state: false });
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
                    <div
                        id="moveableBox"
                        class={style.moveableBox}
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                            transform: `rotate(${degree}deg)`,
                        }}
                    >
                        <div
                            id="centerPoint"
                            class={style.centerPoint}
                        />
                        <div
                            id="controlBox"
                            class={style.controlBox}
                        >
                            <div class={style.targetLine}>
                                <div
                                    id="control"
                                    class={style.rotateControl}
                                />
                            </div>
                            <div
                                id="east"
                                class={style.resizeControl}
                                data-id={"e"}
                                onMouseDown={(e) => {
                                    setResize({ direction: "e", state: true });
                                    setPrev({ x: e.clientX, y: e.clientY });
                                }}
                            />

                            <div
                                class={style.resizeControl}
                                data-id={"w"}
                                onMouseDown={(e) => {
                                    setResize({ direction: "w", state: true });
                                    setPrev({ x: e.clientX, y: e.clientY });
                                }}
                            />
                            <div
                                class={style.resizeControl}
                                data-id={"se"}
                                onMouseDown={(e) => {
                                    setResize({ direction: "se", state: true });
                                    setPrev({ x: e.clientX, y: e.clientY });
                                }}
                            />
                        </div>
                        <div style={{
                            backgroundColor: "skyblue",
                        }} />
                    </div>
                </div>
            </div>
        </div >
    </Fragment >
};

export default Home;
