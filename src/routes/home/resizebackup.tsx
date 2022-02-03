import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './style.scss';

let imgOffset = { x: 0, y: 0 };
let imgRect = { x: 0, y: 0 };

const Home: FunctionalComponent = () => {

    //DESC:: 파일 이름 저장.
    const [file, setFile] = useState("");

    //DESC:: 선택 파일을 저장하는 함수.
    const saveFileImg = (files: FileList) => {
        if (files) setFile(URL.createObjectURL(files[0]));
    };
    // -----------------------------------------------------------------------------------
    //DESC:: rotate 여부 체크
    const [rotate, setRotate] = useState(false);

    //DESC:: 회전 시 각도를 저장
    const [deg, setDeg] = useState(0);

    //DESC:: 박스의 중심점을 저장 
    const [center, setCenter] = useState({ x: 0, y: 0 });
    // -----------------------------------------------------------------------------------

    //DESC:: 이미지를 바꿨을 경우 기존의 변화들을 초기화함.
    useEffect(() => {
        setDeg(0);
        setBoxPos({ top: 200, left: 280 });
        setCenterOfBox();
    }, [file]);

    //DESC:: 이미지의 중심점으로 중심을 잡는 함수
    const setCenterOfBox = () => {
        const point = document.getElementById("centerPoint");
        if (point) {
            const center = {
                x: point?.getBoundingClientRect().left + point?.getBoundingClientRect().width,
                y: point?.getBoundingClientRect().top + point?.getBoundingClientRect().height,
            };
            setCenter(center);
        }
    }

    useEffect(() => {
        const img = document.getElementById("img");
        if (img) {
            const rect = img?.getBoundingClientRect();
            imgRect.x = rect.width;
            imgRect.y = rect.height;
        }
    }, []);

    //----------------------------------------------------------------------
    //DESC:: 박스의 위치(position)
    const [boxPos, setBoxPos] = useState({ top: 200, left: 280 });
    //드래그 기능.
    const [drag, setDrag] = useState(false);

    //DESC:: 박스를 회전하는 함수.
    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        if (rotate) setDeg(Math.round(degree));
    }
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
    const resizeBox = (e: MouseEvent) => {
        if (resize.state) {
            const b = document.getElementById("moveableBox");
            const parent = document.getElementById("canvas");
            if (b && parent) {
                b.style.width = b.offsetWidth - (prev.x - e.clientX) + "px";
                setPrev({ x: e.clientX, y: e.clientY });
            }

        }
        setCenterOfBox();
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
                            transform: `rotate(${deg}deg)`,
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
                                src={file}
                                // src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
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
