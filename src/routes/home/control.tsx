import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {

    //DESC:: 파일 이름 저장.
    const [file, setFile] = useState("");

    //DESC:: 선택 파일을 저장하는 함수.
    const saveFileImg = (e: any) => {
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    //DESC:: 박스의 위치(position)
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    //DESC:: mouseDown 여부 체크
    const [mouseD, setMouseD] = useState(false);

    //DESC:: rotate 여부 체크
    const [rotate, setRotate] = useState(false);

    //DESC:: resize 여부 체크
    const [resize, setResize] = useState(false)

    //DESC:: 회전 시 각도를 저장
    const [deg, setDeg] = useState(0);

    //DESC:: Box 크기를 저장
    const [boxSize, setBoxSize] = useState({ width: "auto", height: "auto" });
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 });


    //DESX:: 테스트 겸 control 버튼의 시작점 저장하기. 
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });


    useEffect(() => { // 이미지를 바꿨을 경우 기존의 변화들을 초기화 
        setDeg(0);
        setBoxPos({ top: 400, left: 480 });
        setBoxSize({ width: "auto", height: "auto" });
    }, [file]);

    //DESC:: 박스를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP"); //.moveableSpace
        const jin = j?.getBoundingClientRect();

        if (jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }
    //DESC:: 박스를 회전하는 함수.
    const rotateBox = (e: MouseEvent) => {
        const image = document.getElementById("image");

        if (image) {

            const imageRef = image.getBoundingClientRect();

            let centerX = image?.offsetLeft + (image?.clientWidth / 2);
            let centerY = image?.offsetTop + (image?.clientHeight / 2);

            const mouseX = e.clientX - imageRef.left;
            const mouseY = e.clientY - imageRef.top;

            const radians = Math.atan2(mouseY - centerY, mouseX - centerX);
            const deg = (radians * (180 / Math.PI) * -1) + 90;

            if (rotate) setDeg(-deg - 180);
        }
    }

    //DESC:: 공간에서 mouseDown했을 때 발생 함수.
    const spaceMouseD = () => {
        setRotate(true);

    }
    //DESC:: 공간에서 mouseMove할때 발생 함수.
    const spaceMouseM = (e: MouseEvent) => {

        //1. 이미지 박스 회전하기.
        rotateBox(e);

        let diffY = startPos.y - e.clientY;
        let diffX = startPos.x - e.clientX;
        // console.log("1. ", imgSize.height);
        // console.log("2. ", diffY);
        // console.log("3. ", imgSize.height - diffY);
        if (resize) {
            setBoxSize({ width: String(imgSize.width), height: String(imgSize.height - diffY) });
        }

    }
    //DESC:: control의 시작점을 정하는 함수.
    const pickStartPos = (e: MouseEvent) => {
        setResize(true);

    }
    const spaceMouseU = () => {
        // setRotate(false);
        setResize(false);
    }
    //DESC:: control버튼의 onMouseUp
    const toDownControlMouseU = (e: MouseEvent) => {
        setResize(false);
    }

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.moveableSpace}
                id="moveSP"
                onMouseDown={(e) => {


                    console.log("mousedown 발생: ", e.currentTarget);
                    //control 버튼의 시작점을 설정한다. 
                    setStartPos({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                    if (mouseD) movePosOfBox(e);
                    spaceMouseM(e);
                }}
                onMouseUp={() => {
                    setMouseD(false);
                    spaceMouseU();
                }}
            >
                {file &&
                    <div class={style.moveableBox}
                        style={{
                            // width를 어떻게 갱신할 지를 모르겠다.
                            width: `${boxSize.width}px`,
                            height: `${boxSize.height}px`,
                            transform: `translate(${boxPos.left}px, ${boxPos.top}px) rotate(${deg}deg)`,
                            maxWidth: 450,
                            maxHeight: 273,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div id="control"
                                class={[style.controlBtn, style.rotate].join(" ")}
                                onMouseDown={() => spaceMouseD()}
                                onMouseUp={() => spaceMouseU()}
                            />
                        </div>
                        {/* <div class={[style.targetBorder, style.N].join(" ")}>
                            <div id="control"
                                class={[style.controlBtn, style.moveSE].join(" ")}
                            />
                        <div id="toDown"
                            class={[style.controlBtn, style.moveS].join(" ")}
                        />
                        <div id="control"
                            class={[style.controlBtn, style.moveSW].join(" ")}
                        />
                    </div>*/}
                        < div style={{
                            border: "1px solid blue",
                            width: "100%",
                            height: "100%",
                            maxWidth: 500,
                            maxHeight: 250,
                        }}>
                            <div class={[style.testControl, style.e].join(" ")} />
                            <div class={[style.testControl, style.w].join(" ")} />

                            <div class={[style.testControl, style.s].join(" ")}
                                onMouseDown={(e) => {
                                    pickStartPos(e);
                                    console.log("target Test: ", e.target);
                                }}
                                onMouseUp={(e) => {
                                    toDownControlMouseU(e)
                                    const update = document.getElementById("image");
                                    if (update) {
                                        const updatedWid = update?.getBoundingClientRect().width;
                                        const updatedHeight = update?.getBoundingClientRect().height;
                                        setImgSize({ width: updatedWid, height: updatedHeight });
                                    }

                                }}
                            />
                            <div class={[style.testControl, style.n].join(" ")} />

                            {/* <div class={[style.targetBorder, style.S].join(" ")}>
                                <div id="control"
                                    class={[style.controlBtn, style.moveSW].join(" ")}
                                />
                                <div id="toTop"
                                    class={[style.controlBtn, style.moveS].join(" ")}
                                    onMouseDown={(e) => {
                                        toDownControlMouseD(e);
                                    }}
                                    onMouseUp={(e) => toDownControlMouseU(e)}

                                />
                                <div id="control"
                                    class={[style.controlBtn, style.moveSE].join(" ")}
                                />
                            </div> */}
                        </div>
                        <img
                            id="image"
                            draggable={false}
                            src={file}
                            // src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                            tabIndex={-1}
                            onMouseDown={(e) => {
                                setCursor({ x: e.offsetX, y: e.offsetY });
                                setMouseD(true);
                            }}
                            onMouseUp={() => setMouseD(false)}
                            onLoad={(e) => {
                                setImgSize({ width: e.currentTarget.width, height: e.currentTarget.height });
                            }}
                            style={{
                                display: "block",
                                objectFit: "fill",
                                width: "100%",
                                height: "100%",
                                maxWidth: 500,
                                maxHeight: 250,
                            }}
                        />
                    </div>
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
            </div>;
        </div >;
    </Fragment >
};

export default Home;
