import { createElement, Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';
// import { MoveBox } from '../../components/moveableBox';

interface HomeState {

}

const Home: FunctionalComponent<HomeState> = () => {
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
    const [boxPos, setBoxPos] = useState({ top: -10, left: 50 });

    const movePosOfBox = (e: any) => {
        // 1. mouseDown 체크 
        if (mouseDown) {
            console.log("line 38: true");
            //1. true면 moveableBox의 css pos값을 바꾼다. >< 어케 해요 이걸....
            /**
             * 1. moveableBox의 offset().left, ~.top 값을 얻어온다. = boxPos. 
             * 2. e.clientX - boxPos - (moveableBox.width /2) 를 moveableBox의 left로 설정한다. 
             * 3. e.clientY - bosPos(top) - (moveableBox.height /2)를 moveableBox의 top으로 설정한다. 
             */


            const boxRef = document.getElementById("boxRef");
            var position = boxRef?.getBoundingClientRect();
            var x = position?.left;
            var y = position?.top;

            console.log("x =", x, "y = ", y);

            if (x != null && y != null) setBoxPos({ top: y, left: x });


            // const boxRef = document.getElementById("boxRef");
            // let leftPos = boxRef?.offsetLeft;
            // let topPos = boxRef?.offsetTop;
            // console.log("offsettop:: ", boxRef?.offsetTop);

            // if (leftPos != null && topPos != null) {
            //     setBoxPos({
            //         top: e.clientX - topPos - (300 / 2), // 일단 이미지 300이라고 고정값 해버림.
            //         left: e.clientY - leftPos - (100 / 2),
            //     });

            // }
        }
    }

    return <Fragment>
        <div class={style.baseLayout}>
            <div class={style.canvas}
                id="canvas"
            >
            </div>
            {/* DESC:: 파일 업로드 기능 */}
            {/* <input type="file"
                hidden
                id="upload"
                onInput={(e) => saveFileImg(e)}
            /> */}
            {/* {file &&
                <div class={style.moveableBox}>

                    <img src={file} alt="error" />
                </div>
            } */}

            <div class={style.moveableBox}
                id="boxRef"
                style={{
                    top: boxPos.top,
                    left: boxPos.left,
                    transform: `translate(-${boxPos.left}, -${boxPos.top})`,
                }}
                onMouseDown={(e) => { console.log(":: onMouseDown", e); setMouseDown(true) }} // 눌렀을 때
                onMouseMove={(e) => { movePosOfBox(e) }} // 마우스 움직였을 때
                onMouseUp={(e) => {
                    console.log(":: onMouseUp", e);
                    setMouseDown(false);
                    console.log("line 73 :: false");
                }} // 눌렀던 마우스를 떼었을 때
            >
                <img id="img"
                    alt="image not found"
                    draggable={false}
                    src="https://i.ytimg.com/vi/Cx3IQsM1X7A/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDvN9Nz_CLDsIeemUMD0VoYY56XZA"
                />
            </div>

            <label htmlFor="upload"
                // class={[style.imageBtn, file && style.active].join(" ")}
                class={[style.imageBtn, style.active].join(" ")}
                onClick={(e) => {
                    console.log(" upload button clicked");
                    // createImg(e)
                }}
            >이미지
            </label>
        </div>
    </Fragment>
};

export default Home;
