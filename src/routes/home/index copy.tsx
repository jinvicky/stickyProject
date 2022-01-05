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
    // =============================================================


    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP"); //.baseLayout
        const jin = j?.getBoundingClientRect();

        // if (mouseDown && jin !== undefined)
        if (jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }

    //DESC:: 이미지를 회전시키는 함수
    const rotateBox = (e: MouseEvent) => {

        //1. img의 width랑 height 구하기.
        let center_x = boxPos.left;
        let center_y = boxPos.top;
        //--------------------------------
        let mouse_x = e.pageX; // TODO:: pageX,pageY  => BoundRect() + scrrenX,Y로 수정하기.
        let mouse_y = e.pageY;




        let radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        // const radians = Math.atan2(mouse_x + size.width, mouse_y + size.height);
        const degree = (radians * (180 / Math.PI) * -1) + 90;


        //회전 각도를 적용한다.
    }

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.baseLayout}
                id="moveSP"
                onMouseMove={(e) => {
                    // movePosOfBox(e);
                }}
            >
                <div class={style.moveableBox}
                    style={{
                        top: boxPos.top,
                        left: boxPos.left,
                        // transform: `rotate(${deg}deg)`,
                    }}
                >
                    <div class={style.targetLine}>
                        <div
                            id="control"
                            class={[style.controlBtn, style.rotate].join(" ")}
                        />
                    </div>
                    <img
                        class="style-scope yt-img-shadow"
                        alt=""
                        width="168"
                        src="https://i.ytimg.com/vi/OFvZO7ul41A/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&amp;rs=AOn4CLCmhy2Cx0PaXRcRo95UJyCYfgpIwg"
                        id="image"
                        draggable={false}
                        tabIndex={-1}
                        onMouseDown={(e) => {
                            setCursor({ x: e.offsetX, y: e.offsetY });
                        }}
                    />
                </div>
                <div class={style.canvas} />
                <input type="file"
                    hidden
                    id="upload"
                    onInput={(e) => saveFileImg(e)}
                />
                <label htmlFor="upload"
                    class={[style.imageBtn, file && style.active].join(" ")}
                >이미지</label>
            </div>;
        </div>;
    </Fragment>
};

export default Home;
