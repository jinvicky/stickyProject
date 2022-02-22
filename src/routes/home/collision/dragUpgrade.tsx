import { createContext, Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './dragUpgrade.scss';
import { Dot, Line, LineDir } from '../type';

let imgOffset = { x: 0, y: 0 };

//네 점의 순서는 시계방향으로 픽스. 
const cLocation = {
    c1: { x: 0, y: 0 },
    c2: { x: 0, y: 0 },
    c3: { x: 0, y: 0 },
    c4: { x: 0, y: 0 },
};

//box로 할 건지 img로 할 건지 통일이 필요한 것 같음. 일단 b, c 보단 i,c가 
// 구별이 더 잘 갈 것 같아서 i로 수정. 
const iLocation = {
    i1: { x: 0, y: 0 },
    i2: { x: 0, y: 0 },
    i3: { x: 0, y: 0 },
    i4: { x: 0, y: 0 },
};
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
            cLocation.c3 = { x: cRect.left, y: cRect.bottom };
            cLocation.c4 = { x: cRect.right, y: cRect.bottom };
        }

    };

    const checkLineIntersect = () => {
        const im = document.getElementById("img");
        if (im) {
            const iRect = im.getBoundingClientRect();
            iLocation.i1 = { x: iRect.left, y: iRect.top };
            iLocation.i2 = { x: iRect.right, y: iRect.top };
            iLocation.i3 = { x: iRect.left, y: iRect.bottom };
            iLocation.i4 = { x: iRect.right, y: iRect.bottom };
        }

        areDotsCollided(cLocation.c1, cLocation.c2, iLocation.i1, iLocation.i2);

    };

    const areDotsCollided = (p1: Dot, p2: Dot, p3: Dot, p4: Dot) => {

        let sign1 = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
        let sign2 = (p2.x - p1.x) * (p4.y - p1.y) - (p4.x - p1.x) * (p2.y - p1.y);

        let sign3 = (p4.x - p3.x) * (p1.y - p3.y) - (p1.x - p3.x) * (p4.y - p3.y);
        let sign4 = (p4.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p4.y - p3.y);

        return sign1 * sign2 < 0 && sign3 * sign4 < 0;


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
        setCenterOfBox();
    }

    useEffect(() => setCenterOfBox(), []);

    return <Fragment>
        <div class={style.root}>
            <div
                id="moveableSpace"
                class={style.moveableSpace}
                onMouseMove={(e) => {
                    if (drag) {
                        movePosOfBox(e);
                        checkLineIntersect();
                    }
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
