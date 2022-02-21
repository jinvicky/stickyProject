import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './dragUpgrade.scss';
import { Dot, Line, LineDir } from './type';

let imgOffset = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    const [rotate, setRotate] = useState(false);
    const [degree, setDegree] = useState(0);
    const [center, setCenter] = useState({ x: 0, y: 0 });

    const [boxOut, setBoxOut] = useState(false);

    /**
     *
     * 네 선분을 네 선분과 비교하기. 
     * 파람으로 받을 참조 3개. 
     * 
     * canvas 값 얻어올 때 
     * top이면 y값은 무조건 top, top
     * top이 아니면 y값은 top, bottom
     * 
     * left면 x값은 무조건 left, left, 
     * left가 아니면 무조건 right, right, 
     * 
     * 
     * left, top : 좌상단    top : true, left: true
     * left, bottom : 좌하단
     * right, top : 우상단 
     * right, bottom : 우하단 
     * 
     * point 값 얻어올 때 
     * 그냥 무조건 x는 left, y는 top으로 가져오면 됨. 
     */

    //캔버스의 left와 박스의 bottom 
    const getCCW18 = (canvas: HTMLElement, se: HTMLElement, sw: HTMLElement) => {
        const cRect = canvas.getBoundingClientRect();
        const swRect = sw.getBoundingClientRect();
        const seRect = se.getBoundingClientRect();

        const p1 = { x: swRect.left, y: swRect.top };
        const p2 = { x: seRect.left, y: seRect.top };
        const p3 = { x: cRect.left, y: cRect.top }; // diff
        const p4 = { x: cRect.left, y: cRect.bottom }; // diff

        return areDotsCollided(p1, p2, p3, p4);
    }

    //캔버스의 top과 박스의 bottom.
    const getCCW28 = (canvas: HTMLElement, se: HTMLElement, sw: HTMLElement) => {
        const cRect = canvas.getBoundingClientRect();
        const swRect = sw.getBoundingClientRect();
        const seRect = se.getBoundingClientRect();

        const p1 = { x: swRect.left, y: swRect.top };
        const p2 = { x: seRect.left, y: seRect.top };
        const p3 = { x: cRect.left, y: cRect.top }; // diff
        const p4 = { x: cRect.right, y: cRect.top }; // diff

        return areDotsCollided(p1, p2, p3, p4);
    };

    const compareLines = () => {
        const canvas = document.getElementById("canvas");
        const sw = document.getElementById("sw");
        const se = document.getElementById("se");

        if (canvas && sw && se) {
            console.log("1, 8의 비교결과:", getCCW18(canvas, sw, se));
            console.log("2, 8의 비교결과:", getCCW28(canvas, sw, se));
        }
    };

    const getCCWTest = (left: boolean, top: boolean, pointLine: Line) => {

        const canvas = document.getElementById("canvas");
        const point1 = document.getElementById(`${Object.keys(pointLine)[0]}`);
        const point2 = document.getElementById(`${Object.keys(pointLine)[1]}`);

        if (canvas && point1 && point2) {
            const cRect = canvas.getBoundingClientRect();
            const p1Rect = point1.getBoundingClientRect();
            const p2Rect = point2.getBoundingClientRect();

            const p1 = { x: p1Rect.left, y: p1Rect.top };
            const p2 = { x: p2Rect.left, y: p1Rect.top };
            let p3 = { x: 0, y: 0 };
            let p4 = { x: 0, y: 0 };

            if (top) {
                p3 = { x: cRect.left, y: cRect.top };
                p4 = { x: cRect.right, y: cRect.top };
            }
            p3 = { x: cRect.left, y: cRect.bottom };
            p4 = { x: cRect.right, y: cRect.bottom };

            if (left) {
                p3 = { x: cRect.left, y: cRect.top };
                p4 = { x: cRect.left, y: cRect.bottom };
            }
            p3 = { x: cRect.right, y: cRect.top };
            p3 = { x: cRect.right, y: cRect.bottom };

            return areDotsCollided(p1, p2, p3, p4);
        }
        return false;
    };

    const movePosOfBox = useCallback((e: MouseEvent) => {

        const el = document.getElementById("canvas");
        if (el) {
            const elRect = el.getBoundingClientRect();
            let x = e.clientX - elRect.left - imgOffset.x;
            let y = e.clientY - elRect.top - imgOffset.y;

            setBoxPos({ left: x, top: y });
            compareLines();
        }
    }, []);

    const areDotsCollided = (p1: Dot, p2: Dot, p3: Dot, p4: Dot) => {
        if (Math.max(p1.x, p2.x) <= Math.min(p3.x, p4.x)) return false;
        if (Math.min(p1.x, p2.x) >= Math.max(p3.x, p4.x)) return false;
        if (Math.max(p1.y, p2.y) <= Math.min(p3.y, p4.y)) return false;
        if (Math.min(p1.y, p2.y) >= Math.max(p3.y, p4.y)) return false;

        let sign1 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
        let sign2 = (p2.x - p1.x) * (p4.y - p1.y) - (p4.x - p1.x) * (p2.y - p1.y);

        let sign3 = (p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y);
        let sign4 = (p4.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p4.y - p3.y);

        if (sign1 == 0 && sign2 == 0 && sign3 == 0 && sign4 == 0) return true;

        return sign1 * sign2 < 0 && sign3 * sign4 < 0;
    };

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
        if (boxOut) {
            setBoxPos({ left: 300, top: 300 });
            setBoxOut(false);
        }
        setCenterOfBox();
    }

    useEffect(() => setCenterOfBox(), []);

    const controlArray = ["e", "w", "s", "n", "se", "ne", "sw", "nw"];

    const controlElems = controlArray.map((direction2, idx) => {
        return <div key={idx}
            class={style.resizeControl}
            data-id={`${direction2}`}
            id={`${direction2}`}
        />;
    });

    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    if (drag) movePosOfBox(e);
                    rotateBox(e);
                }}
                onMouseUp={() => {
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
                            {controlElems}
                        </div>
                        <img
                            id="img"
                            class={style.uploadImg}
                            draggable={false}
                            src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                            style={{
                                width: 250,
                                height: 200,
                            }}
                            onMouseDown={(e) => {
                                setDrag(true);
                                setImgOffset(e);
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
