const el = document.querySelector(".item");

el.addEventListener("mousedown", down);
//1. item의 mousedown 이벤트에 down 함수를 건다.

/**
 * 
 * down 함수는 
 * 1. move, up 함수를 먼저 선언한다. (최상단)
 * 2. move, up을 window 객체와 연결한다. 
 * 3. move는 드래그 거리를 계산하고 up은 window 객체로부터 
 * mousemove, mouseup 이벤트에 걸린 함수들을 제거한다. 
 *
 */



function down(e) {
	window.addEventListener("mousemove", move);
	window.addEventListener("mouseup", up);
	console.log(1);

	let prevX = e.clientX;
	let prevY = e.clientY;

	function move(e) {
		console.log(2);
		let newX = prevX - e.clientX;
		let newY = prevY - e.clientY;

		const rect = el.getBoundingClientRect();
		el.style.left = rect.left - newX + "px";
		el.style.top = rect.top - newY + "px";

		prevX = e.clientX;
		prevY = e.clientY;
		
	}
	function up(e) {
		console.log(3);
		window.removeEventListener("mousemove", move);
		window.removeEventListener("mouseup", up);

	}
}