import { Fragment, FunctionalComponent, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import style from './style.scss';


const Home: FunctionalComponent = () => {

    //DESC:: 파일 이름 저장.
    const [file, setFile] = useState("");

    //DESC:: 선택 파일을 저장하는 함수.
    const saveFileImg = (e: any) => setFile(URL.createObjectURL(e.target.files[0]));
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

    //DESC:: 뷰포트 내에서 함수의 중심점을 잡는 함수
    const setCenterOfBox = () => {
        const target = document.getElementById("image");
        if (target) {
            const center = {
                x: target?.getBoundingClientRect().left + (target?.clientWidth / 2),
                y: target?.getBoundingClientRect().top + (target?.clientHeight / 2)
            }
            setCenter({ x: center.x, y: center.y });
        }
    }
    //DESC:: 박스를 회전하는 함수.
    const rotateBox = (e: MouseEvent) => {
        const x = e.clientX - center.x;
        const y = e.clientY - center.y;
        const degree = (((Math.atan2(x, y) * 180 / Math.PI) * -1) + 180);
        if (rotate) setDeg(degree);
    }

    //----------------------------------------------------------------------
    //DESC:: 박스의 위치(position)
    const [boxPos, setBoxPos] = useState({ top: 200, left: 280 });
    //드래그 기능.
    const [drag, setDrag] = useState(false);

    // .boxWrapper를 onMouseDown했을 때 실행 함수 
    const boxMouseDown = (e: MouseEvent) => {
        setDrag(true)
        setImgOffset({ x: e.offsetX, y: e.offsetY });
        setClient({ x: e.clientX, y: e.clientY });
    };

    const [client, setClient] = useState({ x: 0, y: 0 });
    const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
    const [vasOffset, setVasOffset] = useState({ x: 0, y: 0 });

    const movePosOfBox = useCallback((e: MouseEvent) => {

        const space = document.getElementById("moveableSpace");
        const el = document.getElementById("canvas");
        const box = document.getElementById("box");
        if (space && el && box) {
            const elRect = el.getBoundingClientRect();
            const boxRect = box.getBoundingClientRect();

            let x = e.clientX - elRect.left;
            let y = e.clientY - elRect.top;

            setBoxPos({ left: x, top: y });

            console.log("최종: ", x, y);

        }
        setCenterOfBox(); // 박스 위치 이동시킨 다음에 중심 다시 잡아주기.
    }, []);
    // .boxWrapper를 onMouseUp했을 때 실행 함수 
    const boxMouseUp = () => {
        setDrag(false);
    }
    return <Fragment>
        <div class={style.root}>
            <div class={style.moveableSpace}
                id="moveableSpace"
                onMouseMove={(e) => {
                    if (drag) movePosOfBox(e);
                    rotateBox(e);
                }}
                onMouseUp={() => {
                    setRotate(false);
                    setDrag(false);
                }}
            >
                <div class={style.canvas} id="canvas"
                    onMouseDown={(e) => {
                        setVasOffset({ x: e.offsetX, y: e.offsetY });
                    }}
                >
                    <div class={style.moveableBox}
                        id="box"
                        style={{
                            left: boxPos.left,
                            top: boxPos.top,
                            width: 300,
                            height: 200,
                            transform: `rotate(${deg}deg)`,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div id="control"
                                class={style.rotateControl}
                                onMouseDown={() => setRotate(true)}
                                onMouseMove={(e) => rotateBox(e)}
                                onMouseUp={() => setRotate(false)}
                            />
                        </div>
                        <div class={style.boxWrapper}
                            onMouseDown={(e) => boxMouseDown(e)}
                            onMouseUp={() => boxMouseUp()}
                        >
                            {/* controls */}
                        </div>
                        <img
                            class={style.uploadImg}
                            id="image"
                            draggable={false}
                            // src={file}
                            src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                            tabIndex={-1}
                            onLoad={(e) => { }}
                        />
                    </div>
                </div>
                <input type="file"
                    hidden
                    id="upload"
                    onInput={(e) => saveFileImg(e)}
                />
                <label htmlFor="upload"
                    class={[style.imageBtn, file && style.active].join(" ")}
                >이미지</label>
            </div>
        </div >
    </Fragment >
};

export default Home;
