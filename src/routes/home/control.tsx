import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';


let transObj = { x: 0, y: 0 };


const Home: FunctionalComponent = () => {

    //DESC:: 파일 이름 저장.
    const [file, setFile] = useState("");

    //DESC:: 선택 파일을 저장하는 함수.
    const saveFileImg = (e: any) => setFile(URL.createObjectURL(e.target.files[0]));

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

    //DESC:: 반전을 위한 scale() 값을 저장
    const [scale, setScale] = useState({ x: 1, y: 1 });

    //DESC::  이미지를 바꿨을 경우 기존의 변화들을 초기화함.
    useEffect(() => {
        setDeg(0);
        setBoxPos({ top: 400, left: 480 });
        setBoxSize({ width: "auto", height: "auto" });
    }, [file]);

    //DESC:: 박스를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        // 2번
        const space = document.getElementById("moveSP"); //.moveableSpace
        const spInfo = space?.getBoundingClientRect();

        if (spInfo !== undefined) {
            console.log
            setBoxPos({
                top: e.clientY - cursor.y - spInfo?.top,
                left: e.clientX - cursor.x - spInfo?.left
            });
        }
    }
    //DESC:: 박스를 회전하는 함수.
    const rotateBox = (e: MouseEvent) => {
        const image = document.getElementById("image");

        if (image) {

            const imageRef = image.getBoundingClientRect();

            let centerX = image?.offsetLeft + (image?.clientWidth / 2);
            let centerY = image?.offsetTop + (image?.clientHeight / 2);
            //회전 시 바뀌지 않거나 매번 옳게 계산해야 하는데 둘 다 아님ㅋㅋㅋㅋ

            let mouseX = e.clientX - imageRef.left;
            let mouseY = e.clientY - imageRef.top;

            // console.log("offTst", image?.offsetLeft, image?.offsetTop);
            // console.log(`client w, h : ${image?.clientWidth}, ${image?.clientHeight}`)

            let radians = Math.atan2(mouseY - centerY, mouseX - centerX);

            radians = Math.atan2(e.clientX - centerX, e.clientY - centerY);

            console.log("tst -------", mouseY, mouseX);
            //console.log("tst...................", e.clientX, e.clientY);
            console.log("tset :: ", imageRef.left, imageRef.top);
            console.log("center:: ", centerX, centerY);
            const deg = (radians * (180 / Math.PI)) + 90;

            if (rotate) setDeg(deg);
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
    }

    //DESC:: resizeBox(e)에서 사용하는 setBoxSize의 중복제거 함수
    const resizeBoxWidHeight = (diffX: number = 0, diffY: number = 0) => {
        setBoxSize({
            width: String(imgSize.width - diffX),
            height: String(imgSize.height - diffY)
        });
    }


    //DESC:: testControl의 방향에 따라서 크기를 조절하는 함수 
    const resizeBox = (e: MouseEvent) => {
        let diffX = startPos.x - e.clientX;
        let diffY = startPos.y - e.clientY;

        if (resize) {
            switch (direct) {
                case 'e':
                    resizeBoxWidHeight(diffX);
                    break;
                case 'w':
                    setBoxSize({
                        width: String(imgSize.width + diffX),
                        height: String(imgSize.height - 0)
                    });
                    transObj.x = (imgSize.width - Number(boxSize.width));
                    console.log("transX:::", transObj.x);
                    break;
                case 's':
                    resizeBoxWidHeight(0, diffY);
                    break;
                case 'se':
                    resizeBoxWidHeight(diffX, diffY);
                    break;
                default:
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
                    resizeBox(e); //여기다 걸어야 함...
                }}
                onMouseUp={() => {
                    setMouseD(false);
                    setRotate(false);
                    setResize(false);
                    updateImgSize();
                }}
            >
                {/* {file && */}
                <div class={style.moveableBox}
                    style={{
                        width: Number(boxSize.width),
                        height: Number(boxSize.height),
                        top: boxPos.top,
                        left: boxPos.left,
                        transform: `translate(${transObj.x}px, ${transObj.y}px) rotate(${deg}deg) `,
                    }}
                >
                    <div class={style.targetLine}>
                        <div id="control"
                            class={style.rotateControl}
                            onMouseDown={() => setRotate(true)}
                            onMouseMove={(e) => rotateBox(e)}
                            onMouseUp={() => {
                                setRotate(false);
                                setResize(false);
                            }}
                        />
                    </div>
                    {/* 
                        console.log("----->", (e.offsetX * Math.cos(deg * Math.PI / 180) - e.offsetY * Math.sin(deg * Math.PI / 180)));
                        console.log("----->2", (e.offsetX * Math.sin(deg * Math.PI / 180) + e.offsetY * Math.cos(deg * Math.PI / 180)));
                        
                        
                        
                        
                        */}
                    < div class={style.boxWrapper}
                        onMouseMove={(e) => {
                            // console.log("테스트 x,y===", e.clientX, e.clientY)
                        }}
                        onMouseDown={(e) => {
                            // 1번
                            // console.log("e.client {", e.clientX, e.clientY, "}");
                            // console.log("e.offset {", e.offsetX, e.offsetY, "}");
                            // console.log("=========================================");
                            setCursor({ x: e.offsetX + resizeDiff.x, y: e.offsetY + resizeDiff.y });
                            // const tes = document.getElementById("image");
                            // if (tes) {
                            //     const imgTes = tes?.getBoundingClientRect();
                            //     console.log("확인차...", imgTes.left);
                            //     setCursor({
                            //         x: e.clientX - tes.offsetLeft - e.offsetX,
                            //         y: e.clientY - tes.offsetTop - e.offsetY,
                            //     })
                            //     console.log(cursor, ":: final cursor test");
                            // }

                            setMouseD(true);
                        }}
                        onMouseUp={() => {
                            setMouseD(false)
                        }}
                    >
                        <div class={[style.testControl, style.e].join(" ")}
                            onMouseDown={(e) => controlMouseDown(e, "e")}
                            // onClick={(e) => console.log("est: ", e.offsetX, e.offsetY)} 
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
                        style={{
                            transform: `scale(${scale.x}, ${scale.y})`
                        }}
                    />
                </div>
                {/* } */}
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
