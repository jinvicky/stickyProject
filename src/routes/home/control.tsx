import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
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

    //DESC:: rotate 여부 체크
    const [rotate, setRotate] = useState(false);

    //DESC:: resize 여부 체크
    const [resize, setResize] = useState(false)

    //DESC:: 회전 시 각도를 저장
    const [deg, setDeg] = useState(0);

    //DESC::  이미지 크기를 저장
    const [imgSize, setImgSize] = useState({ width: 0, height: 0 });


    //DESX:: 테스트 겸 control 버튼의 시작점 저장하기. 
    const [startPos, setStartPos] = useState(0);


    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP"); //.moveableSpace
        const jin = j?.getBoundingClientRect();

        if (jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }
    //DESC:: 이미지 회전하는 함수.
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

        const cRef = document.getElementById("toTop"); //함수를 만들 때 toTop등을 파람으로 받아오자.
        if (cRef) {


            let diffPos = startPos - e.clientY;

            // diffPos = e.clientY - startPos;

            console.log("1. ", imgSize.height);
            console.log("2. ", diffPos);
            console.log("3. ", imgSize.height - diffPos);

            if (resize)
                setImgSize({ ...imgSize, height: imgSize.height - diffPos });

        }

    }
    //DESC:: control의 시작점을 정하는 함수.
    const toDownControlMouseD = (e: MouseEvent) => {
        setResize(true);
        setStartPos(e.clientY);

    }
    const spaceMouseU = () => {
        setRotate(false);
        setResize(false);
    }
    //DESC:: control버튼의 onMouseMove 
    const controlMouseM = () => {

    }
    //DESC:: control버튼의 onMouseUp
    const toDownControlMouseU = (e: MouseEvent) => {
        // setResize(false);

    }


    useEffect(() => { // 이미지를 바꿨을 경우 기존의 변화들을 초기화 
        setDeg(0);
        setBoxPos({ top: 400, left: 480 });
        setImgSize({ width: 0, height: 0 });
    }, [file]);

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.moveableSpace}
                id="moveSP"
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
                            width: imgSize.width ? imgSize.width : "auto",
                            height: imgSize.width ? imgSize.height : "auto", // targetLine의 길이 고려
                            transform: `translate(${boxPos.left}px, ${boxPos.top}px) rotate(${deg}deg)`,
                            maxHeight: 250,
                            maxWidth: 450,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div id="control"
                                class={[style.controlBtn, style.rotate].join(" ")}
                                onMouseDown={() => spaceMouseD()}
                                onMouseUp={() => spaceMouseU()}
                            />
                        </div>
                        <div class={[style.targetBorder, style.N].join(" ")}>
                            <div id="control"
                                class={[style.controlBtn, style.moveSE].join(" ")}
                            />
                            {/* 아래로 마우스 이동해서 이미지 줄이는 버튼  */}
                            <div id="toDown"
                                class={[style.controlBtn, style.moveS].join(" ")}
                            />
                            <div id="control"
                                class={[style.controlBtn, style.moveSW].join(" ")}
                            />
                        </div>
                        <div class={[style.targetBorder, style.S].join(" ")}>
                            <div id="control"
                                class={[style.controlBtn, style.moveSW].join(" ")}
                            />
                            {/* 위로 마우스 이동해서 이미지 줄이는 버튼  */}
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
                                width: `100%`,
                                height: "100%",
                                // width: "auto",
                                // height: "auto",
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
        </div>;
    </Fragment>
};

export default Home;
