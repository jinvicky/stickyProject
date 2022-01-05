import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    // =============================================================

    // control mousedown 여부 체크 
    let mousedown = false;

    const [mouPos, setMouPos] = useState({ x: 0, y: 0 });


    const [deg, setDeg] = useState(0);

    //DESC:: 이미지를 회전시키는 함수
    const rotateBox = (e: MouseEvent) => {

    }

    /**
     * 
     * 
     * 
     * 
     */

    return <Fragment>
        <div class={style.root}>
            <div class={style.sideBar} />
            <div class={style.baseLayout}
                id="moveSP"
                onMouseMove={(e) => {

                    console.log("pageX : ", e.pageX);
                    console.log("pageY : ", e.pageY);

                    setMouPos({ x: e.pageX, y: e.pageY })


                    //e.pageX, e.pageY가 내 생각대로 계속 갱신되지 않아서 생기는 이슈.
                    // if (mousedown) {
                    const image = document.getElementById("image");
                    if (image) {
                        const centerX = image?.offsetTop + (image?.clientWidth / 2); //width가 한 20 차이나기는 하는데...
                        const centerY = image?.offsetLeft + (image?.clientHeight / 2); //절반 값은 가져오는 거 같다
                        const mouseX = mouPos.x;
                        const mouseY = mouPos.y;

                        const radians = Math.atan2(mouseY - centerY, mouseX - centerX);
                        const res = (radians * (180 / Math.PI) * -1) + 90;

                        setDeg(res);
                    }
                    // }
                }}
                onMouseUp={() => { mousedown = false }}
            >
                <div class={style.moveableBox}
                    style={{
                        top: boxPos.top,
                        left: boxPos.left,
                        transform: `rotate(${deg}deg)`,
                    }}>
                    <div class={style.targetLine}>
                        <div id="control"
                            class={[style.controlBtn, style.rotate].join(" ")}
                            onMouseDown={() => {
                                mousedown = true;

                            }}
                            onMouseUp={() => {
                                mousedown = false;
                            }}
                        />
                    </div>
                    {/* w: 446px h: 250px */}
                    <img
                        id="image"
                        draggable={false}
                        src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                    />
                </div>
                <div class={style.canvas} />
            </div>;
        </div>;
    </Fragment>
};

export default Home;
