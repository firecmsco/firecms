import {useLayoutEffect, useRef} from 'react';
import {easing, IEasingMap} from 'ts-easing';
import useRaf from './useRaf';

export type Easing = (t: number) => number;

const useTween = (value: number, easingName: keyof IEasingMap = 'quadratic', ms: number = 200, delay: number = 0): number => {

    const fn: Easing = easing[easingName];
    const t = useRaf(value, ms);

    const fromValue = useRef(value);
    const currentValue = useRef(value);
    const toValue = useRef(value);

    useLayoutEffect(() => {
        fromValue.current = currentValue.current;
        toValue.current = value;
    }, [value])

    const delta = toValue.current - fromValue.current;
    currentValue.current = fn(t) * delta + fromValue.current;
    return currentValue.current;
};

export default useTween;