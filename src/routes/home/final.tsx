import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 400, left: 480 });

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    //DESC:: mouseDown 여부 체크
    const [mouseD, setMouseD] = useState(false);

    //DESC:: rotate 여부 체크
    const [rotate, setRotate] = useState(false);

    //DESC:: 회전 시 각도를 저장
    const [deg, setDeg] = useState(0);

    //DESC:: 이미지를 이동시키는 함수
    const movePosOfBox = (e: MouseEvent) => {
        const j = document.getElementById("moveSP"); //.baseLayout
        const jin = j?.getBoundingClientRect();

        if (jin !== undefined)
            setBoxPos({
                top: e.clientY - cursor.y - jin?.top,
                left: e.clientX - cursor.x - jin?.left
            });
    }

    //DESC:: 공간에서 mouseDown했을 때 발생 함수.
    const spaceMouseD = () => {
        setRotate(true);
    }

    //DESC:: 공간에서 mouseMove할때 발생 함수.
    const spaceMouseM = (e: MouseEvent) => {
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

    const spaceMouseU = () => {
        setRotate(false);
    }

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
                <div class={style.moveableBox}
                    style={{
                        transform: `translate(${boxPos.left}px, ${boxPos.top}px) rotate(${deg}deg)`
                    }}
                >
                    <div class={style.targetLine}>
                        <div id="control"
                            class={[style.controlBtn, style.rotate].join(" ")}
                            onMouseDown={() => spaceMouseD()}
                            onMouseUp={() => spaceMouseU()}
                        />
                    </div>
                    <img
                        id="image"
                        draggable={false}
                        src="https://i.ytimg.com/vi/Sedb9CFp-9k/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDZuz1mRyPLNEYDMaQYArjyOct6Yg"
                        tabIndex={-1}
                        onMouseDown={(e) => {
                            setCursor({ x: e.offsetX, y: e.offsetY });
                            setMouseD(true);
                        }}
                        onMouseUp={() => setMouseD(false)}
                    />
                </div>
                <div class={style.canvas} />
            </div>;
        </div>;
    </Fragment>
};

export default Home;
