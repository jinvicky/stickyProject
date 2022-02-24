import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './dragUpgrade.scss';
import { Dot, LocationObj } from '../type';

let imgOffset = { x: 0, y: 0 };

//global로 선언해야 함.
//네 점의 순서는 시계방향으로 픽스. 
const cLocation: LocationObj = {
    c1: { x: 0, y: 0 },
    c2: { x: 0, y: 0 },
    c3: { x: 0, y: 0 },
    c4: { x: 0, y: 0 },
};
const iLocation: LocationObj = {
    i1: { x: 0, y: 0 },
    i2: { x: 0, y: 0 },
    i3: { x: 0, y: 0 },
    i4: { x: 0, y: 0 },
};

const Home: FunctionalComponent = () => {

    const [rotate, setRotate] = useState(false);
    const [degree, setDegree] = useState(0);
    const [center, setCenter] = useState({ x: 0, y: 0 });


    //캔버스의 좌표를 cLocation에 저장하기.
    const getPositionOfCanvas = () => {
        const el = document.getElementById("canvas");
        if (el) {
            const cRect = el.getBoundingClientRect();
            cLocation.c1 = { x: cRect.left, y: cRect.top };
            cLocation.c2 = { x: cRect.right, y: cRect.top };
            cLocation.c3 = { x: cRect.right, y: cRect.bottom };
            cLocation.c4 = { x: cRect.left, y: cRect.bottom };
        }
    };

    const edgeArr = ["nw", "ne", "se", "sw"];

    //edgdArr을 사용해서 control의 중간 좌표를 이미지 모서리 좌표로 지정하기.
    const getPositionOfImg = () => {
        for (let i = 0; i < edgeArr.length; i++) {
            const dotRef = document.querySelector(`[data-id=${edgeArr[i]}]`);
            if (dotRef) {
                const dotRect = dotRef.getBoundingClientRect();

                //control의 중간 지점을 좌표로 지정.
                iLocation[`i${i + 1}`] = {
                    x: dotRect.left + (dotRect.width / 2),
                    y: dotRect.top + (dotRect.height / 2),
                };
            }
        }
    };

    const [imgOut, setImgOut] = useState(false);

    //이미지를 튕길 지 말지 여부를 검사하기.
    const imgFlipValidation = () => {

        getPositionOfImg();

        if (isImgOutOfCanvas() && !areLinesIntersected())
            setImgOut(true);
        else setImgOut(false);
    };

    const isImgOutOfCanvas = (): boolean => {
        const i = document.getElementById("img");
        const c = document.getElementById("canvas");
        if (i && c) {
            const iRect = i.getBoundingClientRect();
            const cRect = c.getBoundingClientRect();

            if (iRect.left < cRect.left ||
                iRect.right > cRect.right ||
                iRect.top < cRect.top ||
                iRect.bottom > cRect.bottom)

                return true;
        }
        return false;
    };

    //선분 교차 여부 검사하기.
    const areLinesIntersected = (): boolean => {

        let isOut = false;

        for (let i = 1; i <= Object.keys(cLocation).length; i++) {
            for (let j = 1; j <= Object.keys(iLocation).length; j++) {
                if (i === Object.keys(cLocation).length) {
                    isOut = areDotsCollided(
                        cLocation[`c${i}`],
                        cLocation[`c${1}`],
                        iLocation[`i${j}`],
                        iLocation[`i${j + 1}`],
                    );
                    if (isOut) return isOut;
                    break;
                }
                if (j === Object.keys(iLocation).length) {
                    isOut = areDotsCollided(
                        cLocation[`c${i}`],
                        cLocation[`c${i + 1}`],
                        iLocation[`i${j}`],
                        iLocation[`i${1}`],
                    );
                    if (isOut) return isOut;
                    break;
                }
                isOut = areDotsCollided(
                    cLocation[`c${i}`],
                    cLocation[`c${i + 1}`],
                    iLocation[`i${j}`],
                    iLocation[`i${j + 1}`],
                );
                if (isOut) return isOut;
            }
        }
        return isOut;
    };

    //선분 교차 여부 검사기가 사용하는 교차검사메서드
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

    //이미지 튕기기.
    const flipImg = () => {
        if (imgOut) {
            setBoxPos({ left: 400, top: 200 });
            setImgOut(false);
        }
    };

    const [boxPos, setBoxPos] = useState({ top: 100, left: 100 });
    //control의 position 테스트.
    const [tPos, setTPos] = useState({ left: 100, top: 100 });

    const movePosOfBox = useCallback((e: MouseEvent) => {

        const el = document.getElementById("canvas");
        if (el) {
            const elRect = el.getBoundingClientRect();
            let x = e.clientX - elRect.left - imgOffset.x;
            let y = e.clientY - elRect.top - imgOffset.y;

            setBoxPos({ left: x, top: y });
            // setTPos({ left: e.clientX - imgOffset.x, top: e.clientY - imgOffset.y });
            setTPos({ left: x, top: y });
        }
    }, []);

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

        // const point = document.getElementById("centerPoint");
        // if (point) {
        //     const center = {
        //         x: point?.getBoundingClientRect().left + point?.getBoundingClientRect().width,
        //         y: point?.getBoundingClientRect().top + point?.getBoundingClientRect().height,
        //     };
        //     setCenter(center);
        // }
    };

    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        rotate && setDegree(Math.round(degree));
    };

    const [drag, setDrag] = useState(false);

    //DESC:: 이미지의 offset을 지정하는 함수 
    const setImgOffset = (e: MouseEvent) => {
        const i = document.getElementById("cursorHelper");
        if (i) {
            const img = i?.getBoundingClientRect();
            imgOffset.x = Math.round(e.clientX - img.left);
            imgOffset.y = Math.round(e.clientY - img.top);
        }
    }

    // 이미지를 onMouseUp했을 때의 함수 . 
    const boxMouseUp = () => {
        setDrag(false);
        flipImg();
        setCenterOfBox();
    }

    useEffect(() => {
        //이미지 좌표가 움직일 때마다 


        setCenterOfBox();

    }, [boxPos]);



    const controlArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];

    const controlElems = controlArray.map((direction2, idx) => {
        return <div key={idx}
            class={style.resizeControl}
            data-id={`${direction2}`}
        />;
    });


    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    if (drag) {
                        movePosOfBox(e);
                    }
                    imgFlipValidation();
                    rotateBox(e);
                }}
                onMouseUp={() => {
                    setRotate(false);
                    setDrag(false);
                    flipImg();

                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: tPos.left,
                        top: tPos.top,
                        width: 10,
                        height: 10,
                        background: "red",
                        display: "inline-block",
                        zIndex: 900,
                        marginTop: -6,
                        marginLeft: -6,
                    }}
                />
                <div
                    id="canvas"
                    class={style.canvas}
                    style={{
                        overflow: "hidden",
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
                            id="controlBox"
                            class={style.controlBox}
                        >
                            {controlElems}
                        </div>
                        <img
                            id="img"
                            class={style.uploadImg}
                            draggable={false}
                            src="https://i.ytimg.com/vi/_YdFyzU8ryA/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLBR6md7CYHbQvWNRJCLdX3ZENSYlg"
                            style={{
                                width: 200,
                                height: 150,
                            }}
                            onMouseDown={(e) => {
                                setDrag(true);
                                setImgOffset(e);
                                getPositionOfCanvas();
                            }}
                            onMouseUp={() => {
                                boxMouseUp();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    </Fragment >
};

export default Home;
