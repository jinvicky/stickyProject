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


    //DESC:: 테스트 겸 control 버튼의 시작점 저장하기. 
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    //DESC:: resize 방향을 저장 
    const [direct, setDirect] = useState("");


    useEffect(() => { // 이미지를 바꿨을 경우 기존의 변화들을 초기화 
        setDeg(0);
        setBoxPos({ top: 400, left: 480 });
        setBoxSize({ width: "auto", height: "auto" });
        // setImgSize({ width: 0, height: 0 }); //not working......
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

    //DESC:: 공간에서 mouseDown했을 때 발생 함수.
    const spaceMouseD = () => {
        setRotate(true);

    }

    /** 경우의 수 
     * 1. width만 바뀌는 경우 
     * 2. height만 바뀌는 경우 
     * 3. width, height 모두 바뀌는 경우 
     * 4. width와 boxPos.left가 바뀌는 경우 
     * 5. height와 boxPos.top이 바뀌는 경우 
     * 6. width, height, boxPos.left, boxPost.top 모두 바뀌는 경우 
     * 
     * 파람이 width, height, both 세 가지 경우로 나뉠 수 있겠고, 
     * top만 바뀌는 경우가 있고, left만 바뀌는 경우가 있고, 
     * top과 left 모두 바뀌는 경우(both)가 있음.
     * 
     */
    //일단은 boxPos를 제외하고 w, h, both를 구별해보자. 
    /**
     * 
     * 구별을 어떻게 하지? direction, useReducer를 써야 하는 건가?          
     */

    //DESC:: control의 시작점을 정하는 함수.
    const pickStartPos = (e: MouseEvent) => {
        setResize(true);

    }
    const spaceMouseU = () => {
        setRotate(false);
        setResize(false);
    }


    const resizeBox = (e: MouseEvent) => { //이벤트 타입을 어쩔지를 모르겠당.......

        let diffX = startPos.x - e.clientX;
        let diffY = startPos.y - e.clientY;

        if (resize) {
            console.log("chk dir:; ", direct);
            switch (direct) {
                case 'e':
                    console.log("1. east");
                    setBoxSize({
                        width: String(imgSize.width - diffX),
                        height: String(imgSize.height - 0)
                    });
                    break;
                case 'se':
                    console.log("1. southeast");
                    setBoxSize({
                        width: String(imgSize.width - diffX),
                        height: String(imgSize.height - diffY)
                    });
                default:
                    console.log("default... no direction????");
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
                    // 문제임....
                    resizeBox(e);
                }}
                onMouseUp={() => {
                    setMouseD(false);
                    spaceMouseU();
                    updateImgSize();
                }}
            >
                {file &&
                    <div class={style.moveableBox}
                        style={{
                            width: `${boxSize.width}px`,
                            height: `${boxSize.height}px`,
                            transform: `translate(${boxPos.left}px, ${boxPos.top}px) rotate(${deg}deg)`,
                        }}
                    >
                        <div class={style.targetLine}>
                            <div id="control"
                                class={style.rotateControl}
                                onMouseDown={() => spaceMouseD()}
                                onMouseUp={() => spaceMouseU()}
                            />
                        </div>
                        < div class={style.boxWrapper}
                            onMouseDown={(e) => {
                                setCursor({ x: e.offsetX, y: e.offsetY });
                                setMouseD(true);
                            }}
                            onMouseUp={() => setMouseD(false)}
                        >
                            <div class={[style.testControl, style.e].join(" ")}
                                data-direction="e"
                                onMouseDown={(e) => {
                                    setDirect("e"); //resize 방향을 지정.
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={() => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />
                            <div class={[style.testControl, style.nw].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={(e) => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />
                            <div class={[style.testControl, style.w].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={(e) => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />
                            <div class={[style.testControl, style.sw].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={(e) => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />

                            <div class={[style.testControl, style.s].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={(e) => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />
                            <div class={[style.testControl, style.n].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={() => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />

                            <div class={[style.testControl, style.se].join(" ")}
                                onMouseDown={(e) => {
                                    setDirect("se");
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={() => {
                                    setResize(false);
                                    updateImgSize();
                                }}
                            />
                            <div class={[style.testControl, style.ne].join(" ")}
                                onMouseDown={(e) => {
                                    setStartPos({ x: e.clientX, y: e.clientY });
                                    e.stopPropagation();
                                    pickStartPos(e);
                                }}
                                onMouseUp={(e) => {
                                    setResize(false);
                                    updateImgSize();
                                }}
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
