import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './centerbackup.scss';

let imgOffset = { x: 0, y: 0 };
let imgRect = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [file, setFile] = useState("");
    const saveFileImg = (files: FileList) => files && setFile(URL.createObjectURL(files[0]));

    // -----------------------------------------------------------------------------------
    const [rotate, setRotate] = useState(false);
    const [degree, setDegree] = useState(0);
    const [center, setCenter] = useState({ x: 0, y: 0 });

    //DESC:: 이미지를 바꿨을 경우 기존의 변화들을 초기화함.
    useEffect(() => {
        setDegree(0);
        setBoxPos({ top: 100, left: 100 });
        setCenterOfBox();
    }, [file]);

    const setCenterOfBox = () => {
        const point = document.getElementById("centerPoint");
        if (point) {
            const center = {
                x: point?.getBoundingClientRect().left + point?.getBoundingClientRect().width,
                y: point?.getBoundingClientRect().top + point?.getBoundingClientRect().height,
            };
            setCenter(center);
        }

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

    useEffect(() => {
        const img = document.getElementById("img");
        if (img) {
            const rect = img?.getBoundingClientRect();
            imgRect.x = rect.width;
            imgRect.y = rect.height;
        }
    }, []);

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

    // ========================================================================
    //DESC:: control 버튼들의 direction을 저장한 배열.
    const controlArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];

    //DESC:: control mousedown시 시작하는 e.clientX,Y 저장
    const [prev, setPrev] = useState({ x: 0, y: 0 });
    const [resize, setResize] = useState({ direction: "one", state: false });

    //DESC:: controlArray를 map해서 출력.
    const controlElems = controlArray.map((direction2, idx) => {

        // if (direction2.length > 1) { //양방향 함수
        return <div key={idx}
            class={style.resizeControl}
            data-id={`${direction2}`}
            onMouseDown={(e) => {
                setResize({ direction: "one", state: true });
                setPrev({ x: e.clientX, y: e.clientY });
            }}
        />;
    });

    //DESC:: img가 onLoad되면 moveableBox의 width, height를 설정하는 함수.
    const setMoveableSize = () => {
        const img = document.getElementById("img");
        const box = document.getElementById("moveableBox");
        if (img && box) {
            const rect = img?.getBoundingClientRect();
            box.style.width = rect.width + "px";
            box.style.height = rect.height + "px";
        }
    }

    //DESC:: 박스 안 이미지를 resize하는 함수 
    const resizeBox2 = (e: MouseEvent) => {
        const b = document.getElementById("moveableBox");
        const ch = document.getElementById("cursorHelper");

        // rotation matrix test 
        if (resize.state && resize.direction === "se") {
            if (b && ch) {
                b.style.width = b.offsetWidth - (prev.x - e.clientX) + "px";
                b.style.height = b.offsetHeight - (prev.y - e.clientY) + "px";
                ch.style.width = b.offsetWidth - (prev.x - e.clientX) + "px";
                ch.style.height = b.offsetHeight - (prev.y - e.clientY) + "px";
                setPrev({ x: e.clientX, y: e.clientY });
                // --------------------------------------------------------

                const newCenter = {
                    x: b.offsetLeft + b.offsetWidth / 2,
                    y: b.offsetTop + b.offsetHeight / 2
                }

                const rotatedA = rotateMatrix(ch.offsetLeft, ch.offsetTop, newCenter.x, newCenter.y, degree);
                const originalA = { x: ch.offsetLeft, y: ch.offsetTop };
                // console.log("before: ", originalA, "after: ", rotatedA);

                const nw = document.getElementById("nw");
                const vas = document.getElementById("canvas");
                if (nw && vas) {
                    const rect = nw.getBoundingClientRect().left;


                    console.log("@@--", rotatedA[0], originalA.x);
                }
            }
        }
        setCenterOfBox();
    };


    const resizeBox = (e: MouseEvent) => {
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
        setCenterOfBox();
    };



    //DESC:: 회전 후에  A` 좌표들을 반환하는 함수. 필요한 값: rect의 x,y좌표(좌상단), CenterOfRect, 각도(angle)
    const rotateMatrix = (x: number, y: number, cx: number, cy: number, angle: number) => {
        return [
            (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
            (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
        ];
    };

    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    if (drag) movePosOfBox(e);
                    rotateBox(e);
                    resizeBox(e);
                }}
                onMouseUp={() => {
                    setRotate(false);
                    setDrag(false);
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
                            id="centerPoint"
                            class={style.centerPoint}
                        />
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
                            {/* 
                            <div
                                id="nw"
                                class={style.resizeControl}
                                data-id={"nw"}
                                onMouseDown={(e) => {
                                    setResize({ direction: "nw", state: true });
                                    setPrev({ x: e.clientX, y: e.clientY });
                                }}
                            /> */}
                        </div>
                        <div
                            id="backimage"
                            class={style.backImage}
                            onMouseDown={(e) => {
                                boxMouseDown(e);
                            }}
                            onMouseUp={() => {
                                boxMouseUp();
                            }}
                        >
                            <img
                                id="img"
                                class={style.uploadImg}
                                draggable={false}
                                // src={file}
                                src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                                tabIndex={-1}
                                onLoad={() => setMoveableSize()}
                            />
                        </div>
                    </div>
                </div>
                <input type="file"
                    hidden
                    id="upload"
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) saveFileImg(target.files);
                    }}
                />
                <label htmlFor="upload"
                    class={[style.imageBtn, file && style.active].join(" ")}
                >이미지</label>
            </div>
        </div >
    </Fragment >
};

export default Home;
