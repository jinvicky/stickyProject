import { createElement, Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {
    //DESC:: 파일 이미지 저장 상태
    const [file, setFile] = useState("");

    //DESC:: control 버튼 활성화 상태인지 판별.
    const [control, setControl] = useState(false);

    //DESC:: 마우스가 이미지 바깥에 위치하는 지 판별.
    const [isPointer, setIsPointer] = useState(false);

    //DESC:: 파일 선택한 이미지를 저장하는 함수.
    const saveFileImg = (e: any) => {
        setFile(URL.createObjectURL(e.target.files[0]));
    }
    //DESC:: mouseDown 상태인지 판별.
    const [mouseDown, setMouseDown] = useState(false);

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: rotate deg값
    const [deg, setDeg] = useState(0);

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });


    /*TODO:: 기존에는 단순히 무블박스의 위치를 바꾸는 함수였으나, 
      현재 baseLayout은 아래의 내용을 모두 반영해야 함.
      1. 무블박스의 실시간 pos 반영.
      2. control-rotate 버튼의 실시간 deg 반영. 
      3. control-nswe 버튼의 실시간 pos 반영해서 무블박스의 w,h 계산.
    */
    const movePosOfBox = (e: MouseEvent) => {
        if (mouseDown) {

            const boxRef = document.getElementById("boxRef"); // 말 그대로 이미지.
            const test = boxRef?.getBoundingClientRect();
            /**
             * elem.getBoundingClientRect();
             * DOMRect {
             *  x, y, width, height, top, left, right, bottom값을 준다.
             * }
             */
            // console.log("45::", test);




            /**문제:: 지금까지 e.clientY, e.clientX로만 움직이고 있었음. 
             leftPos, topPos가 그냥 0인데?? 그니까 왼쪽 상단으로 갔지...멍청쓰.
             
             // let leftPos = boxRef?.offsetLeft;
             // let topPos = boxRef?.offsetTop;
            */

            let leftPos = test?.left;
            let topPos = test?.top;

            /**
             * 실패
             leftPos = e.offsetX;
             topPos = e.offsetY;
             */


            //baseLayout의 offsetLeft, offsetTop을 찍어보자. 




            if (leftPos !== null && topPos !== null && test !== undefined) {
                setBoxPos({
                    top: e.clientY - cursor.y,
                    left: e.clientX - cursor.x,
                });
            }
        }

    }

    const rotateBox = (e: MouseEvent) => {


        let center_x = boxPos.left + 150; // width/2
        let center_y = boxPos.top + 50; // height/2
        let mouse_x = e.pageX;
        let mouse_y = e.pageY;

        let radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        var degree = (radians * (180 / Math.PI) * -1) + 90;

        if (control) {
            setDeg(degree);

        }
        //TODO:: control-rotate 버튼을 눌렀을 때만 회전값이 적용이 되도록 수정해야 함.
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
                // console.log("91 test:: top:", boxPos.top, "left: ", boxPos.left);
                // console.log("92 mouse:: x:", cursor.x, "y: ", cursor.y);
                // rotateBox(e);
            }}
            onMouseUp={() => {
                setMouseDown(false);
                // console.log("97: ------", boxPos.top);
                // console.log("97: ------left", boxPos.left);
            }}
        >
            {file &&

                <div class={style.moveableWrapper}>

                    {
                        control &&
                        <>
                            <div
                                id="control"
                                class={[style.moveable, style.rotate].join(" ")}
                                style={{
                                    transform: `translate(${boxPos.left}px, ${boxPos.top - 40}px) rotate(${deg}deg)`
                                    //-40은 rotate를 했을때 이슈가 생긴다. 
                                }}
                                onMouseDown={(e) => { controlMouseDown(e) }}
                                onMouseMove={(e) => { controlMouseMove(e) }}
                                onMouseUp={(e) => { setMouseDown(false); setIsPointer(false) }}
                            />
                            <div
                                class={[style.moveable, style.moveE].join(" ")}
                            />
                            <div
                                class={[style.moveable, style.moveW].join(" ")}
                            />
                            <div
                                class={[style.moveable, style.moveS].join(" ")}
                            />
                            <div
                                class={[style.moveable, style.moveN].join(" ")}
                            />

                        </>
                    }

                    <div class={style.moveableBox}
                        id="moveable"
                        style={{
                            top: boxPos.top,
                            left: boxPos.left,
                            transform: control ? `rotate(${deg}deg)` : `rotate(0deg)`,
                        }}
                        onClick={() => { setControl(true) }}
                        tabIndex={-1}
                        onMouseDown={(e) => {
                            setMouseDown(true);
                            setCursor({ x: e.offsetX, y: e.offsetY });
                        }}
                        // mousemove이벤트가 발생하면 이미지 내의 마우스 pos를 setMousePos를 한다. 
                        // 근데 실패함....
                        onMouseMove={(e) => {
                            // setCursor({ x: e.offsetX, y: e.offsetY });
                            // 이벤트를 잘못 걸었음. mousemove가 아니라 onMouseDown으로 해서 한번만 잡았어야 함.
                        }}
                        onMouseUp={() => {
                            setMouseDown(false);
                            setControl(true);
                        }}
                        onPointerEnter={(e): void => setIsPointer(true)}
                        onPointerLeave={(e): void => setIsPointer(false)}
                        onBlur={(e): void => { if (!isPointer) setControl(false); }}
                    ><img
                            id="boxRef"
                            alt="image not found"
                            draggable={false}
                            src={file}
                        />
                    </div>
                </div>
            }

            <div class={style.canvas} id="canvas">
                <iframe
                    src="https://www.youtube.com/embed/YUs-4jXaLa8"
                    crossOrigin="anonymous"
                    frameBorder="0"
                />
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
    </Fragment>
};

export default Home;
