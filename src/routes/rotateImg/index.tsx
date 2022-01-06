import { Fragment, FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {
    // rotate 기능

    //DESC:: 무블 박스 pos값
    const [boxPos, setBoxPos] = useState({ top: 600, left: 480 });

    //DESC:: 이미지 안에서의 mouse pos값 
    const [cursor, setCursor] = useState({ x: 0, y: 0 });

    //DESC:: 회전 시 각도를 저장
    const [deg, setDeg] = useState(0);

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

    const [rotate, setRotate] = useState(false);

    //DESC:: 공간에서 mouseDown했을 때 발생 함수.
    const spaceMouseD = () => {
        setRotate(true);
    }

    //DESC:: 공간에서 mouseMove할때 발생 함수.
    const spaceMouseM = (e: MouseEvent) => {
        const image = document.getElementById("image");

        if (image) {

            const imageRef = image.getBoundingClientRect();

            let centerX = image?.offsetLeft + (image?.clientWidth / 2); //절반 값은 가져오는 거 같다
            let centerY = image?.offsetTop + (image?.clientHeight / 2); //width가 한 20 차이나기는 하는데...

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
                onMouseMove={(e) => { spaceMouseM(e) }}
                onMouseUp={(e) => spaceMouseU()}
            >
                <div class={style.moveableBox}
                    style={{
                        transform: `translate(${boxPos.left}px, ${boxPos.top}px) rotate(${deg}deg)`
                    }}>
                    <div class={style.targetLine}>
                        <div id="control"
                            class={[style.controlBtn, style.rotate].join(" ")}
                            onMouseDown={(e) => spaceMouseD()}
                            onMouseUp={(e) => spaceMouseU()}
                        />
                    </div>
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
