import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './dragUpgrade.scss';
import { Dot, iObj, test } from '../type';

let imgOffset = { x: 0, y: 0 };

//global로 선언해야 함.
//네 점의 순서는 시계방향으로 픽스. 
const cLocation = {
    c1: { x: 0, y: 0 },
    c2: { x: 0, y: 0 },
    c3: { x: 0, y: 0 },
    c4: { x: 0, y: 0 },
};
const iLocation: iObj = {};

/**
 * 
 * 문제풀이 과정 
 * 1. iArray랑 cArray 배열을 각각 만들고 거기에 { }
 * 
 * object.entries()를 쓰면 key, value를 모두 반환한다. 
 * 그러면 key를 보고 판단해서 c4인 경우에 두번째 파람으로 c1을 넣으면 되긴 하는데 
 * 그러면 [i+1]식의 시계방향 비교가 안된다. 
 */

const Home: FunctionalComponent = () => {

    const [rotate, setRotate] = useState(false);
    const [degree, setDegree] = useState(0);
    const [center, setCenter] = useState({ x: 0, y: 0 });


    const getCanvasPos = () => {
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

    const getImgPos = () => {
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
    const isImgOutOfCanvas = () => {

        const b = document.getElementById("img");
        const c = document.getElementById("canvas");
        if (b && c) {
            const iRect = b.getBoundingClientRect();
            const cRect = c.getBoundingClientRect();

            /**
             * 이미지의 top이 캔버스의 bottom 보다 크면 탈출.
             * 이미지의 bottom이 캔버스의 top 보다 작으면 탈출.
             * 이미지의 left가 캔버스의 right 보다 크면 탈출.
             * 이미지의 right가 캔버스의 left 보다 작으면 탈출.
             */

            if (iRect.top > cRect.bottom ||
                iRect.bottom < cRect.top ||
                iRect.left > cRect.right ||
                iRect.right < cRect.left)
                return true;
        }
        return false;
    };

    const checkImgOut = () => { // 두 메서드를 사용해서 imgOut 상태 관리하는 함수. 
        // 이미지 모서리 좌표 구하기 
        getImgPos();
        // 캔버스 바깥에 있고 선분 겹침도 없으면 flipImg 함수를 활성화 시키기. 


        // if (isImgOutOfCanvas() && checkLineIntersect()) setImgOut(true);
    };

    const checkLineIntersect = () => {
        //16번 선분 비교를 수행한다. 16번이 모두 겹치지 않아야 true를 반환한다.
        /**areDotsCollided() 함수를 16번 돌려야 한다.
         * 다만 선분이 대각선이 되지 않는 조합이어야 한다. 
         * 
         * 안되는 조합 : c1과 c3, c2와 c4, i1과 i3, i2와 i4.  (반대도 마찬가지)
         * 그러면 대각선을 방지하는 메서드를 하나 더 만들어야 하나
         * 
         * 
         * */
        return true;
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

    //DESC:: 이미지 튕기기 메서드.
    const flipImg = () => {
        if (imgOut) {
            setBoxPos({ left: 400, top: 200 });
            setImgOut(false);
        }
    };

    const boxArray = ["c1", "c2", "c3", "c4"];
    const vasArray = ["i5", "i6", "i7", "i8"];


    const finalObj: test = [{ L1: { p1: "", p2: "" }, L2: { p1: "", p2: "" } }];

    //콘솔 테스트 함수 
    const consoleTest = () => {

        for (let i = 0; i < boxArray.length; i++) {
            for (let j = 0; j < vasArray.length; j++) {
                finalObj.push({
                    L1: { p1: boxArray[i], p2: boxArray[i] === "c4" ? "c1" : boxArray[i + 1] },
                    L2: { p1: vasArray[j], p2: vasArray[j] === "i8" ? "i5" : vasArray[j + 1] }
                });
            }
        }
        console.log("테스트, ", finalObj);


    }

    const movePosOfBox = useCallback((e: MouseEvent) => {

        const el = document.getElementById("canvas");
        if (el) {
            const elRect = el.getBoundingClientRect();
            let x = e.clientX - elRect.left - imgOffset.x;
            let y = e.clientY - elRect.top - imgOffset.y;

            setBoxPos({ left: x, top: y });
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

    // 이미지를 onMouseUp했을 때의 함수 . 
    const boxMouseUp = () => {
        setDrag(false);
        flipImg();
        setCenterOfBox();
    }

    useEffect(() => setCenterOfBox(), [boxPos]);

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
                    checkImgOut();
                    rotateBox(e);
                }}
                onMouseUp={() => {
                    setRotate(false);
                    setDrag(false);
                    flipImg();

                    consoleTest();
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
                            id="controlBox"
                            class={style.controlBox}
                            style={{
                                opacity: 0.4
                            }}
                        >
                            {controlElems}
                        </div>
                        <img
                            id="img"
                            class={style.uploadImg}
                            draggable={false}
                            src="https://i.ytimg.com/vi/_YdFyzU8ryA/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLBR6md7CYHbQvWNRJCLdX3ZENSYlg"
                            style={{
                                width: 250,
                                height: 200,
                            }}
                            onMouseDown={(e) => {
                                setDrag(true);
                                setImgOffset(e);
                                getCanvasPos();
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
