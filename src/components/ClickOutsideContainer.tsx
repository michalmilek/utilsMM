import React, {
	cloneElement,
	FunctionComponent,
	HTMLAttributes,
	MutableRefObject,
	ReactElement,
	RefCallback,
	useEffect,
	useRef,
} from "react";

type FocusEvents = "focusin" | "focusout";
type MouseEvents = "click" | "mousedown" | "mouseup";
type TouchEvents = "touchstart" | "touchend";
type Events = FocusEvent | MouseEvent | TouchEvent;

type Props = {
	onClickOutside: (event: Events) => void;
	focusEvent?: FocusEvents;
	mouseEvent?: MouseEvents;
	touchEvent?: TouchEvents;
	children: ReactElement<HTMLAttributes<HTMLElement>>;
};

const eventTypeMapping = {
	click: "onClick",
	focusin: "onFocus",
	focusout: "onFocus",
	mousedown: "onMouseDown",
	mouseup: "onMouseUp",
	touchstart: "onTouchStart",
	touchend: "onTouchEnd",
};

export const ClickOutsideContainer: FunctionComponent<Props> = ({
	children,
	onClickOutside,
	focusEvent = "focusin",
	mouseEvent = "click",
	touchEvent = "touchend",
}) => {
	const node = useRef<HTMLElement | null>(null);
	const bubbledEventTarget = useRef<EventTarget | null>(null);
	const mountedRef = useRef(false);

	useEffect(() => {
		setTimeout(() => {
			mountedRef.current = true;
		}, 0);

		return () => {
			mountedRef.current = false;
		};
	}, []);

	const handleBubbledEvents =
		(type: string) =>
		(event: Events): void => {
			bubbledEventTarget.current = event.target;

			const handler = children?.props[type];

			if (handler) {
				handler(event);
			}
		};

	const handleChildRef = (childRef: HTMLElement) => {
		node.current = childRef;

		const { ref } = children as typeof children & {
			ref: RefCallback<HTMLElement> | MutableRefObject<HTMLElement>;
		};

		if (typeof ref === "function") {
			ref(childRef);
		} else if (ref) {
			ref.current = childRef;
		}
	};

	useEffect(() => {
		const nodeDocument = node.current?.ownerDocument ?? document;

		const handleEvents = (event: Events): void => {
			if (!mountedRef.current) {
				return;
			}

			if (
				(node.current && node.current.contains(event.target as Node)) ||
				bubbledEventTarget.current === event.target ||
				!nodeDocument.contains(event.target as Node)
			) {
				return;
			}

			onClickOutside(event);
		};

		nodeDocument.addEventListener(mouseEvent, handleEvents);
		nodeDocument.addEventListener(touchEvent, handleEvents);
		nodeDocument.addEventListener(focusEvent, handleEvents);

		return () => {
			nodeDocument.removeEventListener(mouseEvent, handleEvents);
			nodeDocument.removeEventListener(touchEvent, handleEvents);
			nodeDocument.removeEventListener(focusEvent, handleEvents);
		};
	}, [focusEvent, mouseEvent, onClickOutside, touchEvent]);

	const mappedMouseEvent = eventTypeMapping[mouseEvent];
	const mappedTouchEvent = eventTypeMapping[touchEvent];
	const mappedFocusEvent = eventTypeMapping[focusEvent];

	return React.Children.only(
		cloneElement(children as ReactElement, {
			ref: handleChildRef,
			[mappedFocusEvent]: handleBubbledEvents(mappedFocusEvent),
			[mappedMouseEvent]: handleBubbledEvents(mappedMouseEvent),
			[mappedTouchEvent]: handleBubbledEvents(mappedTouchEvent),
		})
	);
};

//full a11y clickoutside component
