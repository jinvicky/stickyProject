import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {
    //DESC:: 파일 이미지 저장 상태
    const [file, setFile] = useState("");

    //DESC:: 파일 선택한 이미지를 저장하는 함수.
    const saveFileImg = (e: any) => {
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    //DESC:: mouseDown 여부 체크
    const [mouseD, setMouseD] = useState(false);

    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP");
        const jin = j?.getBoundingClientRect();

        if (jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.moveableSpace}
                id="moveSP"
                onMouseMove={(e) => {
                    if (mouseD) movePosOfBox(e);
                }}
                onMouseUp={() => setMouseD(false)}
            >
                {file &&
                    <div class={style.moveableBox}
                        style={{
                            transform: `translate(${boxPos.left}px, ${boxPos.top}px)`
                        }}
                    >
                        <div class={style.targetLine}>
                            <div
                                id="control"
                                class={[style.controlBtn, style.rotate].join(" ")}
                            />
                        </div>
                        <img
                            id="image"
                            draggable={false}
                            src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                            tabIndex={-1}
                            onMouseDown={(e) => {
                                setCursor({ x: e.offsetX, y: e.offsetY });
                                setMouseD(true);
                            }}
                            onMouseUp={() => setMouseD(false)}
                        />
                    </div>}
                <div class={style.canvas} />
            </div>;
        </div>;
    </Fragment>
};

export default Home;
