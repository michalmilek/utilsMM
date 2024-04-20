import { RefObject, useEffect } from "react";

type EventTypes =
	| "click"
	| "mousedown"
	| "mouseup"
	| "touchstart"
	| "touchend"
	| "focusin"
	| "focusout";
type AnyEvent = MouseEvent | TouchEvent | FocusEvent;

export const useClickOutside = (
	ref: RefObject<HTMLElement>,
	onClickAway: (event: AnyEvent) => void,
	{
		mouseEvent = "click",
		touchEvent = "touchend",
		focusEvent = "focusin",
	}: {
		mouseEvent?: EventTypes;
		touchEvent?: EventTypes;
		focusEvent?: EventTypes;
	} = {}
): void => {
	useEffect(() => {
		const eventHandler = (event: AnyEvent) => {
			if (!ref.current || ref.current.contains(event.target as Node)) {
				return;
			}

			onClickAway(event);
		};

		document.addEventListener(mouseEvent, eventHandler);
		document.addEventListener(touchEvent, eventHandler);
		document.addEventListener(focusEvent, eventHandler);

		return () => {
			document.removeEventListener(mouseEvent, eventHandler);
			document.removeEventListener(touchEvent, eventHandler);
			document.removeEventListener(focusEvent, eventHandler);
		};
	}, [ref, onClickAway, mouseEvent, touchEvent, focusEvent]);
};

/*
EXAMPLE USAGE:

function App() {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleClickAway = event => {
    console.log('click outside element', event);
  };

  useClickAway(ref, handleClickAway);

  return (
    <div ref={ref} style={{ padding: 20, background: 'lightblue', width: 200, height: 200, position: 'relative' }}>
      Click outside me
    </div>
  );
}

export default App;

*/
