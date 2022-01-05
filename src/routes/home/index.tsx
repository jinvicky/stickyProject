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


    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });


    //DESC:: 회전모드 여부 체크.
    const [rotate, setRotate] = useState(false);

    //DESC:: 회전 deg값
    const [deg, setDeg] = useState(0);


    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP"); //.baseLayout
        const jin = j?.getBoundingClientRect();

        if (mouseDown && jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }

    //DESC:: 이미지를 회전시키는 함수
    const rotateBox = (e: MouseEvent) => {

        let center_x = boxPos.left;
        let center_y = boxPos.top;
        //--------------------------------
        let mouse_x = e.pageX; // TODO:: pageX,pageY  => BoundRect() + scrrenX,Y로 수정하기.
        let mouse_y = e.pageY;

        let radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        var degree = (radians * (180 / Math.PI) * -1) + 90;

        //회전 각도를 적용한다.
        setDeg(degree);
    }

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.baseLayout}
                id="moveSP"
                onMouseMove={(e) => {
                    movePosOfBox(e);
                    //2. 회전 모드면 박스를 돌린다.
                    if (rotate) rotateBox(e);
                }}
                onMouseUp={() => {
                    setMouseDown(false);
                    //3. 마우스를 뗐을 때 회전모드면 회전모드 종료시키기. 
                    if (rotate) setRotate(false);
                }}
            >
                {file && <>
                    <div class={style.moveableBox}
                        style={{
                            top: boxPos.top,
                            left: boxPos.left,
                            transform: `rotate(${deg}deg)`,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div
                                id="control"
                                class={[style.controlBtn, style.rotate].join(" ")}
                                onMouseDown={() => {
                                    // setControl(true);
                                    // setIsPointer(true); 임시 주석처리...삭제 ㄴ
                                    //1. 회전모드를 활성화시킨다.
                                    setRotate(true);


                                }}
                                onMouseUp={(e) => {
                                    setMouseDown(false);
                                    //4. 마우스를 떼면 회전모드 종료. 
                                    setRotate(false);
                                }}
                            />
                        </div>
                        <img
                            alt="err"
                            draggable={false}
                            src={file}
                            tabIndex={-1}
                            onClick={() => { setControl(true) }}
                            onMouseDown={(e) => {
                                setCursor({ x: e.offsetX, y: e.offsetY });
                                setMouseDown(true);
                            }}
                            onMouseUp={() => {
                                setMouseDown(false);
                                setControl(true);
                            }}
                            onPointerEnter={(e): void => setIsPointer(true)}
                            onPointerLeave={(e): void => setIsPointer(false)}
                            onBlur={(e): void => { if (!isPointer) setControl(false); }}
                        />
                    </div>
                </>
                }
                <div class={style.canvas} />
                <input type="file"
                    hidden
                    id="upload"
                    onInput={(e) => saveFileImg(e)}
                />
                <label htmlFor="upload"
                    class={[style.imageBtn, file && style.active].join(" ")}
                >이미지</label>
            </div>
        </div>

    </Fragment>
};

export default Home;
