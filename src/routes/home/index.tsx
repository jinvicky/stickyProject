import { createElement, Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {
    //DESC:: 파일 이미지 저장 상태
    const [file, setFile] = useState("");

    //DESC:: 파일 선택한 이미지를 저장하는 함수.
    const saveFileImg = (e: any) => {
        setFile(URL.createObjectURL(e.target.files[0]));
        console.log(file);
    }
    //DESC:: 마우스 이벤트 판별값 
    const [mouseDown, setMouseDown] = useState(false);

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: rotate deg값
    const [deg, setDeg] = useState(0);

    //DESC:: control 버튼 상태, 이미지를 클릭해야만 활성화.
    const [control, setControl] = useState(false);

    //DESC:: 마우스가 이미지를 떠났는 지 여부
    const [isPointer, setIsPointer] = useState(false);


    /*TODO:: 기존에는 단순히 무블박스의 위치를 바꾸는 함수였으나, 
      현재 baseLayout은 아래의 내용을 모두 반영해야 함.
      1. 무블박스의 실시간 pos 반영.
      2. control-rotate 버튼의 실시간 deg 반영. 

    */
    const movePosOfBox = (e: any) => {
        if (mouseDown) {

            let center_x = boxPos.left + 150; // width/2
            let center_y = boxPos.top + 50; // height/2
            let mouse_x = e.pageX;
            let mouse_y = e.pageY;

            let radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
            var degree = (radians * (180 / Math.PI) * -1) + 90;

            if (control) {
                setDeg(degree);

            }
            //TODO:: control 버튼을 눌렀을 때만 회전값이 적용이 되도록 수정해야 함.
        }
    }



    //DESC:: 선택 시 생기는 동그라미 버튼 onMouseDown했을 때 함수
    const controlMouseDown = (e: MouseEvent) => {
        setMouseDown(true);
        setIsPointer(true);
    }

    const controlMouseMove = (e: MouseEvent) => {
    }

    return <Fragment>
        <div class={style.baseLayout}
            onMouseMove={(e) => {
                movePosOfBox(e);
            }}
            onMouseUp={() => setMouseDown(false)}
        >
            {
                control &&
                <div
                    id="control"
                    class={[style.moveable, style.rotate].join(" ")}
                    style={{
                        top: boxPos.top - 50,
                        left: boxPos.left + 150, // width 300의 1/2, TODO:: 동적으로 바꿔야 함.
                        transform: `rotate(${deg}deg)`,
                    }}
                    onMouseDown={(e) => { controlMouseDown(e) }}
                    onMouseMove={(e) => { controlMouseMove(e) }}
                    onMouseUp={(e) => { console.log("50: mouseup"); setMouseDown(false); setIsPointer(false) }}
                />
            }

            {file &&
                <div class={style.moveableBox}
                    id="moveable"
                    style={{
                        top: boxPos.top,
                        left: boxPos.left,
                        transform: control ? `rotate(${deg}deg)` : `rotate(0deg)`,
                    }}
                    onClick={() => { setControl(true) }}
                    tabIndex={-1}
                    onMouseDown={(e) => { setMouseDown(true) }}
                    onMouseUp={(e) => {
                        setMouseDown(false);
                    }}
                    onPointerEnter={(e): void => setIsPointer(true)}
                    onPointerLeave={(e): void => setIsPointer(false)}
                    onBlur={(e): void => { if (!isPointer) setControl(false); }}
                >
                    <img
                        id="boxRef"
                        alt="image not found"
                        draggable={false}
                        src={file}
                    />
                </div>
            }
            <div class={style.canvas} id="canvas" />
            <input type="file"
                hidden
                id="upload"
                onInput={(e) => saveFileImg(e)}
            />
            <label htmlFor="upload"
                class={[style.imageBtn, file && style.active].join(" ")}
            >이미지</label>
        </div>
    </Fragment>
};

export default Home;
