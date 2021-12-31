import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import style from './style.scss';

const Home: FunctionalComponent = () => {

    //스티커의 위치 값
    const [pos, setPos] = useState({ pageX: 70, pageY: -90 });
    // 스티커 크기 조절 버튼 ON/OFF
    //TODO:: Click 이벤트를 파람으로 감지한다. 
    const [control, setControl] = useState(false);

    const dragCheck = (e: MouseEvent) => {

        console.log("page x: ", e.clientX);
        console.log("page x: ", e.clientY);
    }

    //
    const movePos = (e: MouseEvent) => {
        e.preventDefault();
        setPos({ pageX: e.pageX, pageY: e.pageY });
    }

    return <Fragment>
        <div class={style.baseLayout}>
            <div class={style.canvas}>
                <div class={style.moveableBox}
                    style={`transform: translate(${pos.pageX}px, ${pos.pageY}px);`}
                >
                    <img id="img"
                        draggable={false}
                        alt=""
                        src="https://i.ytimg.com/vi/Cx3IQsM1X7A/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&amp;rs=AOn4CLDvN9Nz_CLDsIeemUMD0VoYY56XZA"
                    />
                    <div class={[style.moveable, style.rotate].join(" ")} />
                    <div class={style.stick} />
                    <div class={[style.moveable, style.moveE].join(" ")} />
                    <div class={[style.moveable, style.moveW].join(" ")} />
                    <div class={[style.moveable, style.moveS].join(" ")} />
                    <div class={[style.moveable, style.moveN].join(" ")} />
                </div>
            </div>
        </div>
    </Fragment>
};

export default Home;
