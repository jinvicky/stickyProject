import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';


let gvResizeDiffY = 0;

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

    //DESC:: 테스트 겸 control 버튼의 시작점 저장하기. 
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    //DESC:: resize 방향을 저장 
    const [direct, setDirect] = useState("");

    //DESC:: resize 크기를 저장 
    const [resizeDiff, setResizeDiff] = useState({ x: 0, y: 0 });

    //DESC::  이미지를 바꿨을 경우 기존의 변화들을 초기화함.
    useEffect(() => {
        setDeg(0);
        setBoxPos({ top: 400, left: 480 });
        setBoxSize({ width: "auto", height: "auto" });
        // setImgSize({ width: 0, height: 0 }); //not working......
        setResizeDiff({ x: 0, y: 0 });
        gvResizeDiffY = 0;
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

    //DESC:: 박스 수정 후 변경된 이미지 사이즈를 저장하는 함수 
    const updateImgSize = () => {
        const update = document.getElementById("image");
        if (update) {
            const updatedWid = update?.getBoundingClientRect().width;
            const updatedHeight = update?.getBoundingClientRect().height;
            setImgSize({ width: updatedWid, height: updatedHeight });
        }
    }

    //DESC:: control들을 onMouseDown했을 때 사용하는 함수
    const controlMouseDown = (e: MouseEvent, direction: string) => {
        setDirect(direction);
        setStartPos({ x: e.clientX, y: e.clientY });
        e.stopPropagation();
        setResize(true);
    }

    //DESC:: control들을 onMouseUp했을 때 사용하는 함수
    const controlMouseUP = () => {
        setResize(false);
        updateImgSize();
        console.log("사이즈 체크 :: ", gvResizeDiffY);

        setResizeDiff({ ...resizeDiff, y: gvResizeDiffY });


    }

    const resizeBox = (e: MouseEvent) => {
        let diffX = startPos.x - e.clientX;
        let diffY = startPos.y - e.clientY;

        if (resize) {
            switch (direct) {
                case 'e':
                    console.log("1. east");
                    setBoxSize({
                        width: String(imgSize.width - diffX),
                        height: String(imgSize.height - 0)
                    });
                    break;
                case 's':
                    console.log("2. south");
                    setBoxSize({
                        width: String(imgSize.width - 0),
                        height: String(imgSize.height - diffY)
                    });
                    break;
                case 'se':
                    console.log("3. southeast");
                    setBoxSize({
                        width: String(imgSize.width - diffX),
                        height: String(imgSize.height - diffY)
                    });
                    break;
                case 'w':
                    console.log("4. west");
                    if (-diffX < 0) diffX = 0;
                    else if (-diffX > 0) {
                        setBoxSize({
                            width: String(imgSize.width + diffX > 450 ? 450 : imgSize.width + diffX),
                            height: String(imgSize.height - 0)
                        });
                        setResizeDiff({
                            ...resizeDiff,
                            x: -diffX,
                        });
                    }
                    break;
                case 'n':
                    console.log("5. north");
                    if (-diffY < 0) diffY = 0;
                    else if (-diffY > 0) {

                        gvResizeDiffY = -diffY;
                        console.log("gvResizeDiffY ::1.", gvResizeDiffY);

                        setBoxSize({
                            width: String(imgSize.width - 0),
                            height: String(imgSize.height + diffY),
                        });
                        setResizeDiff({
                            ...resizeDiff,
                            y: gvResizeDiffY,
                        });

                        gvResizeDiffY += -diffY;

                        console.log("gvResizeDiffY ::2.", gvResizeDiffY);
                    }
                    break;
                default:
                    console.log("no direction????");
                    break;
            }
        }
    }

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.moveableSpace}
                id="moveSP"
                onMouseMove={(e) => {
                    if (mouseD) movePosOfBox(e);
                    rotateBox(e);
                    resizeBox(e);
                }}
                onMouseUp={() => {
                    setMouseD(false);
                    setRotate(false);
                    setResize(false);
                    updateImgSize();
                }}
            >
                {file &&
                    <div class={style.moveableBox}
                        style={{
                            width: Number(boxSize.width),
                            height: Number(boxSize.height),
                            top: boxPos.top,
                            left: boxPos.left,
                            transform: `translate(${resizeDiff.x}px, ${resizeDiff.y}px) rotate(${deg}deg)`,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div id="control"
                                class={style.rotateControl}
                                onMouseDown={() => setRotate(true)}
                                onMouseUp={() => {
                                    setRotate(false);
                                    setResize(false);
                                }}
                            />
                        </div>
                        < div class={style.boxWrapper}
                            onMouseDown={(e) => {
                                //DESC:: 이미지 w,h가 변해도 이미지 안 커서를 제대로 계산하기 위함.
                                setCursor({ x: e.offsetX + resizeDiff.x, y: e.offsetY + resizeDiff.y });
                                setMouseD(true);
                            }}
                            onMouseUp={() => setMouseD(false)}
                        >
                            <div class={[style.testControl, style.e].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "e")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.nw].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "nw")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.w].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "w")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.sw].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "sw")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.s].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "s")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.n].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "n")}
                                onClick={(e) => console.log("clied:::", gvResizeDiffY)}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.se].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "se")}
                                onMouseUp={() => controlMouseUP()}
                            />
                            <div class={[style.testControl, style.ne].join(" ")}
                                onMouseDown={(e) => controlMouseDown(e, "ne")}
                                onMouseUp={() => controlMouseUP()}
                            />
                        </div>
                        <img
                            class={style.uploadImg}
                            id="image"
                            draggable={false}
                            src={file}
                            // src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                            tabIndex={-1}
                            onLoad={(e) => {
                                setImgSize({
                                    width: e.currentTarget.width,
                                    height: e.currentTarget.height
                                });
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
