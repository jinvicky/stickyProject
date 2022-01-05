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

    //DESC:: control 버튼 활성화 상태인지 판별.
    const [control, setControl] = useState(false);

    //DESC:: 마우스가 이미지 바깥에 위치하는 지 판별.
    const [isPointer, setIsPointer] = useState(false);

    //DESC:: mouseDown 상태인지 판별.
    const [mouseDown, setMouseDown] = useState(false);

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: rotate deg값
    const [deg, setDeg] = useState(0);

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    //DESC:: control 버튼의 mouse pos값 
    const [contCursor, setContCursor] = useState({ x: 0, y: 0 });


    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        if (mouseDown)
            setBoxPos({ top: e.clientY - cursor.y, left: e.clientX - cursor.x });
    }

    //DESC:: 이미지를 회전시키는 함수
    const rotateBox = (e: MouseEvent) => {

        let center_x = boxPos.left;
        let center_y = boxPos.top;
        let mouse_x = e.pageX;
        let mouse_y = e.pageY;

        let radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        var degree = (radians * (180 / Math.PI) * -1) + 90;
        console.log("deg: ", degree);

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


    return <Fragment>
        <div class={style.baseLayout}
            // onMouseDown={(e) => rotateBox(e)}
            onMouseMove={(e) => {
                movePosOfBox(e);
                // rotateBox(e);
            }}
            onMouseUp={() => {
                setMouseDown(false);
            }}
        >
            {file && <>
                <div class={style.moveableBox} // target element
                    id="moveable"
                    style={{
                        top: boxPos.top,
                        left: boxPos.left,
                        transform: `rotate(${deg}deg)`,
                    }}
                    onMouseDown={e => setCursor({ x: e.offsetX, y: e.offsetY })}
                >
                    <div class={style.targetLine}>
                        {/* {control && */}
                        <>
                            <div
                                id="control"
                                class={[style.controlBtn, style.rotate].join(" ")}
                                onMouseDown={(e) => {
                                    // rotateBox(e);
                                    setControl(true);
                                    setIsPointer(true);
                                    // setContCursor({ x: e.offsetX, y: e.offsetY });
                                    // controlMouseDown(e);
                                }}
                                onMouseMove={(e) => {
                                    // rotateBox(e);
                                }}
                                onMouseUp={(e) => {
                                    setMouseDown(false);
                                    // setIsPointer(false)
                                }}
                            />
                        </>
                        {/* } */}
                    </div>
                    {/* <div class={style.controlTest}>
                        <div class={[style.controlBtn, style.moveNW].join(" ")}></div>
                        <div class={[style.controlBtn, style.moveW].join(" ")}></div>
                    </div> */}
                    <img id="boxRef"
                        alt="image not found"
                        draggable={false}
                        src={file}
                        onClick={() => { setControl(true) }}
                        tabIndex={-1}
                        onMouseDown={(e) => {
                            setMouseDown(true);
                            // setCursor({ x: e.offsetX, y: e.offsetY });
                        }}
                        onMouseUp={() => {
                            setMouseDown(false);
                            setControl(true);
                        }}
                        onPointerEnter={(e): void => setIsPointer(true)}
                        onPointerLeave={(e): void => setIsPointer(false)}
                        onBlur={(e): void => { if (!isPointer) setControl(false); }}
                    >
                    </img>
                </div>
            </>
            }
            <div class={style.canvas} id="canvas">
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
