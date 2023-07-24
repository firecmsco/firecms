import React, { forwardRef, useRef } from "react";
import clsx from "clsx";
// @ts-ignore
import DatePicker from "react-datepicker";

import { useInjectStyles } from "./util/useInjectStyles";
import { CalendarMonthIcon, ClearIcon } from "../icons";
import { IconButton } from "./IconButton";
import { useFireCMSContext } from "../hooks";
import { fieldBackgroundDisabledMixin, fieldBackgroundHoverMixin, fieldBackgroundMixin, focusedMixin } from "../styles";
import { InputLabel } from "./InputLabel";

interface DateTimeFieldProps {
    value?: Date;
    onChange: (date: Date | null) => void;
    mode?: "date" | "date_time";
    disabled?: boolean;
    clearable?: boolean;
    error?: boolean;
    size: "small" | "medium";
    label?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    inputClassName?: string;
    invisible?: boolean;
    preventOpenOnFocus?: boolean;
}

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
                                                                value,
                                                                label,
                                                                onChange,
                                                                disabled,
                                                                clearable,
                                                                mode = "date",
                                                                error,
                                                                size,
                                                                className,
                                                                style,
                                                                inputClassName,
                                                                preventOpenOnFocus,
                                                                invisible
                                                            }) => {

    const ref = useRef(null);
    const { locale } = useFireCMSContext();

    const inputRef = useRef(null);
    const [focused, setFocused] = React.useState(document.activeElement === inputRef.current);
    const hasValue = value !== undefined && value !== null;

    useInjectStyles("DateTimeField", datePickerCss);
    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange(null);
    }

    return (
        <div
            className={clsx(
                "rounded-md relative max-w-full",
                !invisible && fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                {
                    "min-h-[48px]": size === "small",
                    "min-h-[64px]": size === "medium"
                },
                className)}
            style={style}>

            {label && (
                <InputLabel
                    className={clsx("absolute top-1 pointer-events-none",
                        !error ? (focused ? "text-primary" : "text-text-secondary dark:text-text-secondary-dark") : "text-red-500 dark:text-red-600",
                        disabled ? "opacity-50" : "")}
                    shrink={hasValue || focused}
                >
                    {label}
                </InputLabel>
            )}

            <DatePicker
                ref={ref}
                locale={locale}
                selected={value ?? null}
                onChange={onChange}
                disabled={false}
                onClick={(e: any) => e.stopPropagation()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                showTimeSelect={mode === "date_time"}
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat={mode === "date_time" ? "Pp" : "P"}
                preventOpenOnFocus={true}
                className={clsx(
                    "w-full outline-none bg-transparent leading-normal text-base px-3",
                    clearable ? "pr-14" : "pr-12",
                    "rounded-md",
                    !invisible && focusedMixin,
                    size === "small" ? "min-h-[48px]" : "min-h-[64px]",
                    label ? "pt-[28px] pb-2" : "py-2",
                    inputClassName,
                    disabled && "border border-transparent outline-none opacity-50 dark:opacity-50 text-gray-600 dark:text-gray-500"
                )}
            />

            <IconButton
                onClick={() => {
                    // @ts-ignore
                    return ref.current?.setOpen(true);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 !text-gray-500 ">
                <CalendarMonthIcon color={"disabled"}/>
            </IconButton>

            {clearable && value && (
                <IconButton
                    onClick={handleClear}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 ">
                    <ClearIcon/>
                </IconButton>
            )}
        </div>
    );
}

const datePickerCss = `
.react-datepicker__year-read-view--down-arrow,
.react-datepicker__month-read-view--down-arrow,
.react-datepicker__month-year-read-view--down-arrow, .react-datepicker__navigation-icon::before {
  border-color: #ccc;
  border-style: solid;
  border-width: 3px 3px 0 0;
  content: "";
  display: block;
  height: 9px;
  position: absolute;
  top: 6px;
  width: 9px;
}

.react-datepicker-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0;
  border: 0;
}

.react-datepicker {
  font-size: 0.8rem;
  background-color: #fff;
  color: #000;
  border: 1px solid #e7e7e9;
  border-radius: 4px;
  display: inline-flex;
  position: relative;
}

.react-datepicker--time-only .react-datepicker__time-container {
  border-left: 0;
}
.react-datepicker--time-only .react-datepicker__time,
.react-datepicker--time-only .react-datepicker__time-box {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.react-datepicker__triangle {
 display: none;
}

.react-datepicker-popper {
  z-index: 1;
  min-width: 348px;
}
.react-datepicker-popper[data-placement^=bottom] {
  padding-top: 10px;
}
.react-datepicker-popper[data-placement^=top] {
  padding-bottom: 10px;
}
.react-datepicker-popper[data-placement^=right] {
  padding-left: 8px;
}
.react-datepicker-popper[data-placement^=left] {
  padding-right: 8px;
}

.react-datepicker__header {
  text-align: center;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e7e7e9;
  border-top-left-radius: 4px;
  padding: 16px;
  position: relative;
}
.react-datepicker__header--time {
  padding-bottom: 8px;
  padding-left: 5px;
  padding-right: 5px;
}
.react-datepicker__header--time:not(.react-datepicker__header--time--only) {
  border-top-left-radius: 0;
}
.react-datepicker__header:not(.react-datepicker__header--has-time-select) {
  border-top-right-radius: 4px;
}

.react-datepicker__year-dropdown-container--select,
.react-datepicker__month-dropdown-container--select,
.react-datepicker__month-year-dropdown-container--select,
.react-datepicker__year-dropdown-container--scroll,
.react-datepicker__month-dropdown-container--scroll,
.react-datepicker__month-year-dropdown-container--scroll {
  display: inline-block;
  margin: 0 15px;
}

.react-datepicker__current-month,
.react-datepicker-time__header,
.react-datepicker-year-header {
  margin-top: 0;
  color: #000;
  font-weight: 500;
  font-size: 1rem;
}

.react-datepicker-time__header {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.react-datepicker__navigation {
  align-items: center;
  background: none;
  display: flex;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  position: absolute;
  top: 2px;
  padding: 0;
  border: none;
  z-index: 1;
  height: 32px;
  width: 32px;
  text-indent: -999em;
  overflow: hidden;
}
.react-datepicker__navigation--previous {
  top: 12px;
  left: 4px;
}
.react-datepicker__navigation--next {
  top: 12px;
  right: 4px;
}
.react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {
  right: 85px;
}
.react-datepicker__navigation--years {
  position: relative;
  top: 0;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.react-datepicker__navigation--years-previous {
  top: 4px;
}
.react-datepicker__navigation--years-upcoming {
  top: -4px;
}
.react-datepicker__navigation:hover *::before {
  border-color: #a6a6a6;
}

.react-datepicker__navigation-icon {
  position: relative;
  top: -1px;
  font-size: 20px;
  width: 0;
}
.react-datepicker__navigation-icon--next {
  left: -2px;
}
.react-datepicker__navigation-icon--next::before {
  transform: rotate(45deg);
  left: -7px;
}
.react-datepicker__navigation-icon--previous {
  right: -2px;
}
.react-datepicker__navigation-icon--previous::before {
  transform: rotate(225deg);
  right: -7px;
}

.react-datepicker__month-container {
  float: left;
}

.react-datepicker__year {
  margin: 0.4rem;
  text-align: center;
}
.react-datepicker__year-wrapper {
  display: flex;
  flex-wrap: wrap;
  max-width: 180px;
}
.react-datepicker__year .react-datepicker__year-text {
  display: inline-block;
  width: 4rem;
  margin: 2px;
}

.react-datepicker__month {
  margin: 16px;
  text-align: center;
}
.react-datepicker__month .react-datepicker__month-text,
.react-datepicker__month .react-datepicker__quarter-text {
  display: inline-block;
  width: 4rem;
  margin: 2px;
}

.react-datepicker__input-time-container {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 5px 0 10px 15px;
  text-align: left;
}
.react-datepicker__input-time-container .react-datepicker-time__caption {
  display: inline-block;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container {
  display: inline-block;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__input {
  display: inline-block;
  margin-left: 10px;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__input input {
  width: auto;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__input input[type=time]::-webkit-inner-spin-button,
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__input input[type=time]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__input input[type=time] {
  -moz-appearance: textfield;
}
.react-datepicker__input-time-container .react-datepicker-time__input-container .react-datepicker-time__delimiter {
  margin-left: 5px;
  display: inline-block;
}

.react-datepicker__time-container {
  float: right;
  border-left: 1px solid #e7e7e9;
  width: 85px;
  height: 308px;
}
.react-datepicker__time-container--with-today-button {
  display: inline;
  border: 1px solid #e7e7e9;
  border-radius: 4px;
  position: absolute;
  right: -87px;
  top: 0;
}
.react-datepicker__time-container .react-datepicker__time {
  position: relative;
  background: white;
  border-bottom-right-radius: 4px;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
  width: 85px;
  overflow-x: hidden;
  margin: 0 auto;
  text-align: center;
  border-bottom-right-radius: 4px;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list {
  list-style: none;
  margin: 0;
  height: calc(195px + (1.7rem / 2));
  overflow-y: scroll;
  padding-right: 0;
  padding-left: 0;
  width: 100%;
  height: 100%;
  box-sizing: content-box;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
  height: 30px;
  padding: 5px 10px;
  white-space: nowrap;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
  cursor: pointer;
  background-color: #f0f0f0;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
  background-color: #216ba5;
  color: white;
  font-weight: 500;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected:hover {
  background-color: #216ba5;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled {
  color: #ccc;
}
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--disabled:hover {
  cursor: default;
  background-color: transparent;
}

.react-datepicker__week-number {
  color: #ccc;
  display: inline-block;
  width: 1.7rem;
  line-height: 1.7rem;
  text-align: center;
  margin: 0.166rem;
}
.react-datepicker__week-number.react-datepicker__week-number--clickable {
  cursor: pointer;
}
.react-datepicker__week-number.react-datepicker__week-number--clickable:hover {
  border-radius: 4px;
  background-color: #f0f0f0;
}

.react-datepicker__day-names,
.react-datepicker__week {
  white-space: nowrap;
}

.react-datepicker__day-names {
  margin-bottom: -8px;
}

.react-datepicker__day-name,
.react-datepicker__day,
.react-datepicker__time-name {
  color: #000;
  display: inline-block;
  width: 1.7rem;
  line-height: 1.7rem;
  text-align: center;
  margin: 0.166rem;
}

.react-datepicker__day,
.react-datepicker__month-text,
.react-datepicker__quarter-text,
.react-datepicker__year-text {
  cursor: pointer;
}
.react-datepicker__day:hover,
.react-datepicker__month-text:hover,
.react-datepicker__quarter-text:hover,
.react-datepicker__year-text:hover {
  border-radius: 100%;
  background-color: #f0f0f0;
}
.react-datepicker__day--today,
.react-datepicker__month-text--today,
.react-datepicker__quarter-text--today,
.react-datepicker__year-text--today {
  font-weight: 500;
}
.react-datepicker__day--highlighted,
.react-datepicker__month-text--highlighted,
.react-datepicker__quarter-text--highlighted,
.react-datepicker__year-text--highlighted {
  border-radius: 100%;
  background-color: #3dcc4a;
  color: #fff;
}
.react-datepicker__day--highlighted:hover,
.react-datepicker__month-text--highlighted:hover,
.react-datepicker__quarter-text--highlighted:hover,
.react-datepicker__year-text--highlighted:hover {
  background-color: #32be3f;
}
.react-datepicker__day--highlighted-custom-1,
.react-datepicker__month-text--highlighted-custom-1,
.react-datepicker__quarter-text--highlighted-custom-1,
.react-datepicker__year-text--highlighted-custom-1 {
  color: magenta;
}
.react-datepicker__day--highlighted-custom-2,
.react-datepicker__month-text--highlighted-custom-2,
.react-datepicker__quarter-text--highlighted-custom-2,
.react-datepicker__year-text--highlighted-custom-2 {
  color: green;
}
.react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range,
.react-datepicker__month-text--selected,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__month-text--in-range,
.react-datepicker__quarter-text--selected,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__quarter-text--in-range,
.react-datepicker__year-text--selected,
.react-datepicker__year-text--in-selecting-range,
.react-datepicker__year-text--in-range {
  border-radius: 100%;
  background-color: #216ba5;
  color: #fff;
}
.react-datepicker__day--selected:hover, .react-datepicker__day--in-selecting-range:hover, .react-datepicker__day--in-range:hover,
.react-datepicker__month-text--selected:hover,
.react-datepicker__month-text--in-selecting-range:hover,
.react-datepicker__month-text--in-range:hover,
.react-datepicker__quarter-text--selected:hover,
.react-datepicker__quarter-text--in-selecting-range:hover,
.react-datepicker__quarter-text--in-range:hover,
.react-datepicker__year-text--selected:hover,
.react-datepicker__year-text--in-selecting-range:hover,
.react-datepicker__year-text--in-range:hover {
  background-color: #1d5d90;
}
.react-datepicker__day--keyboard-selected,
.react-datepicker__month-text--keyboard-selected,
.react-datepicker__quarter-text--keyboard-selected,
.react-datepicker__year-text--keyboard-selected {
  border-radius: 100%;
  background-color: #bad9f1;
  color: rgb(0, 0, 0);
}
.react-datepicker__day--keyboard-selected:hover,
.react-datepicker__month-text--keyboard-selected:hover,
.react-datepicker__quarter-text--keyboard-selected:hover,
.react-datepicker__year-text--keyboard-selected:hover {
  background-color: #1d5d90;
}
.react-datepicker__day--in-selecting-range:not(.react-datepicker__day--in-range,
.react-datepicker__month-text--in-range,
.react-datepicker__quarter-text--in-range,
.react-datepicker__year-text--in-range),
.react-datepicker__month-text--in-selecting-range:not(.react-datepicker__day--in-range,
.react-datepicker__month-text--in-range,
.react-datepicker__quarter-text--in-range,
.react-datepicker__year-text--in-range),
.react-datepicker__quarter-text--in-selecting-range:not(.react-datepicker__day--in-range,
.react-datepicker__month-text--in-range,
.react-datepicker__quarter-text--in-range,
.react-datepicker__year-text--in-range),
.react-datepicker__year-text--in-selecting-range:not(.react-datepicker__day--in-range,
.react-datepicker__month-text--in-range,
.react-datepicker__quarter-text--in-range,
.react-datepicker__year-text--in-range) {
  background-color: rgba(33, 107, 165, 0.5);
}
.react-datepicker__month--selecting-range .react-datepicker__day--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range), .react-datepicker__year--selecting-range .react-datepicker__day--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__month--selecting-range .react-datepicker__month-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__year--selecting-range .react-datepicker__month-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__month--selecting-range .react-datepicker__quarter-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__year--selecting-range .react-datepicker__quarter-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__month--selecting-range .react-datepicker__year-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range),
.react-datepicker__year--selecting-range .react-datepicker__year-text--in-range:not(.react-datepicker__day--in-selecting-range,
.react-datepicker__month-text--in-selecting-range,
.react-datepicker__quarter-text--in-selecting-range,
.react-datepicker__year-text--in-selecting-range) {
  background-color: #f0f0f0;
  color: #000;
}
.react-datepicker__day--disabled,
.react-datepicker__month-text--disabled,
.react-datepicker__quarter-text--disabled,
.react-datepicker__year-text--disabled {
  cursor: default;
  color: #ccc;
}
.react-datepicker__day--disabled:hover,
.react-datepicker__month-text--disabled:hover,
.react-datepicker__quarter-text--disabled:hover,
.react-datepicker__year-text--disabled:hover {
  background-color: transparent;
}

.react-datepicker__input-container {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}
.react-datepicker__input-container .react-datepicker__calendar-icon {
  position: absolute;
  padding: 0.5rem;
}

.react-datepicker__view-calendar-icon input {
  padding: 6px 10px 5px 25px;
}

.react-datepicker__year-read-view,
.react-datepicker__month-read-view,
.react-datepicker__month-year-read-view {
  border: 1px solid transparent;
  border-radius: 4px;
  position: relative;
}
.react-datepicker__year-read-view:hover,
.react-datepicker__month-read-view:hover,
.react-datepicker__month-year-read-view:hover {
  cursor: pointer;
}
.react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow,
.react-datepicker__year-read-view:hover .react-datepicker__month-read-view--down-arrow,
.react-datepicker__month-read-view:hover .react-datepicker__year-read-view--down-arrow,
.react-datepicker__month-read-view:hover .react-datepicker__month-read-view--down-arrow,
.react-datepicker__month-year-read-view:hover .react-datepicker__year-read-view--down-arrow,
.react-datepicker__month-year-read-view:hover .react-datepicker__month-read-view--down-arrow {
  border-top-color: #e7e7e9;
}
.react-datepicker__year-read-view--down-arrow,
.react-datepicker__month-read-view--down-arrow,
.react-datepicker__month-year-read-view--down-arrow {
  transform: rotate(135deg);
  right: -16px;
  top: 0;
}

.react-datepicker__year-dropdown,
.react-datepicker__month-dropdown,
.react-datepicker__month-year-dropdown {
  background-color: #f0f0f0;
  position: absolute;
  width: 50%;
  left: 25%;
  top: 30px;
  z-index: 1;
  text-align: center;
  border-radius: 4px;
  border: 1px solid #e7e7e9;
}
.react-datepicker__year-dropdown:hover,
.react-datepicker__month-dropdown:hover,
.react-datepicker__month-year-dropdown:hover {
  cursor: pointer;
}
.react-datepicker__year-dropdown--scrollable,
.react-datepicker__month-dropdown--scrollable,
.react-datepicker__month-year-dropdown--scrollable {
  height: 150px;
  overflow-y: scroll;
}

.react-datepicker__year-option,
.react-datepicker__month-option,
.react-datepicker__month-year-option {
  line-height: 20px;
  width: 100%;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.react-datepicker__year-option:first-of-type,
.react-datepicker__month-option:first-of-type,
.react-datepicker__month-year-option:first-of-type {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.react-datepicker__year-option:last-of-type,
.react-datepicker__month-option:last-of-type,
.react-datepicker__month-year-option:last-of-type {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.react-datepicker__year-option:hover,
.react-datepicker__month-option:hover,
.react-datepicker__month-year-option:hover {
  background-color: #ccc;
}
.react-datepicker__year-option:hover .react-datepicker__navigation--years-upcoming,
.react-datepicker__month-option:hover .react-datepicker__navigation--years-upcoming,
.react-datepicker__month-year-option:hover .react-datepicker__navigation--years-upcoming {
  border-bottom-color: #e7e7e9;
}
.react-datepicker__year-option:hover .react-datepicker__navigation--years-previous,
.react-datepicker__month-option:hover .react-datepicker__navigation--years-previous,
.react-datepicker__month-year-option:hover .react-datepicker__navigation--years-previous {
  border-top-color: #e7e7e9;
}
.react-datepicker__year-option--selected,
.react-datepicker__month-option--selected,
.react-datepicker__month-year-option--selected {
  position: absolute;
  left: 15px;
}

.react-datepicker__close-icon {
  cursor: pointer;
  background-color: transparent;
  border: 0;
  outline: 0;
  padding: 0 6px 0 0;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: table-cell;
  vertical-align: middle;
}
.react-datepicker__close-icon::after {
  cursor: pointer;
  background-color: #216ba5;
  color: #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  padding: 2px;
  font-size: 12px;
  line-height: 1;
  text-align: center;
  display: table-cell;
  vertical-align: middle;
  content: "×";
}

.react-datepicker__today-button {
  background: #f0f0f0;
  border-top: 1px solid #e7e7e9;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  padding: 5px 0;
  clear: left;
}

.react-datepicker__portal {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  left: 0;
  top: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  z-index: 2147483647;
}
.react-datepicker__portal .react-datepicker__day-name,
.react-datepicker__portal .react-datepicker__day,
.react-datepicker__portal .react-datepicker__time-name {
  width: 3rem;
  line-height: 3rem;
}
@media (max-width: 400px), (max-height: 550px) {
  .react-datepicker__portal .react-datepicker__day-name,
  .react-datepicker__portal .react-datepicker__day,
  .react-datepicker__portal .react-datepicker__time-name {
    width: 2rem;
    line-height: 2rem;
  }
}
.react-datepicker__portal .react-datepicker__current-month,
.react-datepicker__portal .react-datepicker-time__header {
  font-size: 1.44rem;
}

.react-datepicker__children-container {
  width: 13.8rem;
  margin: 0.4rem;
  padding-right: 0.2rem;
  padding-left: 0.2rem;
  height: auto;
}

.react-datepicker__aria-live {
  position: absolute;
  clip-path: circle(0);
  border: 0;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  width: 1px;
  white-space: nowrap;
}

.react-datepicker__calendar-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}


:is([data-theme="dark"]) .react-datepicker__year-read-view--down-arrow,
:is([data-theme="dark"]) .react-datepicker__month-read-view--down-arrow,
:is([data-theme="dark"]) .react-datepicker__month-year-read-view--down-arrow,
:is([data-theme="dark"]) .react-datepicker__navigation-icon::before {
  border-color: #333;
}


:is([data-theme="dark"]) .react-datepicker-wrapper,
:is([data-theme="dark"]) .react-datepicker {
  color: #ccc;
}

:is([data-theme="dark"]) .react-datepicker__navigation:hover *::before {
  border-color: #e7e7e9;
}

:is([data-theme="dark"]) .react-datepicker__day-names,
:is([data-theme="dark"]) .react-datepicker__week {
  color: #ccc;
}

:is([data-theme="dark"]) .react-datepicker__day,
:is([data-theme="dark"]) .react-datepicker__month-text,
:is([data-theme="dark"]) .react-datepicker__quarter-text,
:is([data-theme="dark"]) .react-datepicker__year-text {
  color: #ccc;
}

:is([data-theme="dark"]) .react-datepicker__current-month,
:is([data-theme="dark"]) .react-datepicker-time__header,
:is([data-theme="dark"]) .react-datepicker-year-header,
:is([data-theme="dark"]) .react-datepicker__day-name,
:is([data-theme="dark"]) .react-datepicker__year-dropdown-container--select,
:is([data-theme="dark"]) .react-datepicker__month-dropdown-container--select,
:is([data-theme="dark"]) .react-datepicker__month-year-dropdown-container--select,
:is([data-theme="dark"]) .react-datepicker__year-dropdown-container--scroll,
:is([data-theme="dark"]) .react-datepicker__month-dropdown-container--scroll,
:is([data-theme="dark"]) .react-datepicker__month-year-dropdown-container--scroll {
  color: #ccc;
}

:is([data-theme="dark"]) .react-datepicker__header {
  background-color: #262626;
  color: #fff;
}

:is([data-theme="dark"]) .react-datepicker__day--disabled,
:is([data-theme="dark"]) .react-datepicker__month-text--disabled,
:is([data-theme="dark"]) .react-datepicker__quarter-text--disabled,
:is([data-theme="dark"]) .react-datepicker__year-text--disabled {
  color: #666;
}

:is([data-theme="dark"]) .react-datepicker__day--highlighted,
:is([data-theme="dark"]) .react-datepicker__month-text--highlighted,
:is([data-theme="dark"]) .react-datepicker__quarter-text--highlighted,
:is([data-theme="dark"]) .react-datepicker__year-text--highlighted {
  background-color: #1a1a1a;
  color: #fff;
}

:is([data-theme="dark"]) .react-datepicker__day:hover,
:is([data-theme="dark"]) .react-datepicker__day--in-range:hover,
:is([data-theme="dark"]) .react-datepicker__day--selected:hover,
:is([data-theme="dark"]) .react-datepicker__month-text:hover,
:is([data-theme="dark"]) .react-datepicker__day:hover,
:is([data-theme="dark"]) .react-datepicker__month-text--in-range:hover,
:is([data-theme="dark"]) .react-datepicker__month-text--selected:hover,
:is([data-theme="dark"]) .react-datepicker__quarter-text:hover,
:is([data-theme="dark"]) .react-datepicker__day:hover,
:is([data-theme="dark"]) .react-datepicker__quarter-text--in-range:hover,
:is([data-theme="dark"]) .react-datepicker__quarter-text--selected:hover,
:is([data-theme="dark"]) .react-datepicker__year-text:hover,
:is([data-theme="dark"]) .react-datepicker__day:hover,
:is([data-theme="dark"]) .react-datepicker__year-text--in-range:hover,
:is([data-theme="dark"]) .react-datepicker__year-text--selected:hover,
:is([data-theme="dark"]) .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover
 {
  background-color: #1a1a1a;
}

:is([data-theme="dark"]) .react-datepicker__day--selected,
:is([data-theme="dark"]) .react-datepicker__day--in-range,
:is([data-theme="dark"]) .react-datepicker__day--in-selecting-range,
:is([data-theme="dark"]) .react-datepicker__month-text--selected,
:is([data-theme="dark"]) .react-datepicker__month-text--in-range,
:is([data-theme="dark"]) .react-datepicker__month-text--in-selecting-range,
:is([data-theme="dark"]) .react-datepicker__quarter-text--selected,
:is([data-theme="dark"]) .react-datepicker__quarter-text--in-range,
:is([data-theme="dark"]) .react-datepicker__quarter-text--in-selecting-range,
:is([data-theme="dark"]) .react-datepicker__year-text--selected,
:is([data-theme="dark"]) .react-datepicker__year-text--in-range,
:is([data-theme="dark"]) .react-datepicker__year-text--in-selecting-range {
  background-color: #0e528f;
}

:is([data-theme="dark"]) .react-datepicker__day--keyboard-selected,
:is([data-theme="dark"]) .react-datepicker__month-text--keyboard-selected,
:is([data-theme="dark"]) .react-datepicker__quarter-text--keyboard-selected,
:is([data-theme="dark"]) .react-datepicker__year-text--keyboard-selected {
  background-color: #0e529f;
}

:is([data-theme="dark"]) .react-datepicker__today-button {
  background-color: #262626;
  color: #ccc;
}

:is([data-theme="dark"]) .react-datepicker__portal {
  background-color: #191919;
}

:is([data-theme="dark"]) .react-datepicker{
  background-color: #262626;
  border: 1px solid #e7e7e9;
  color: #fff;
}

:is([data-theme="dark"]) .react-datepicker__time-list{
  background-color: rgba(0, 0, 0, 0.0);
}
:is([data-theme="dark"]) .react-datepicker__month-container{
  background-color: rgba(0, 0, 0, 0.0);
}

:is([data-theme="dark"]) .react-datepicker__time-container--with-today-button {
  border: 1px solid transparent;
}
:is([data-theme="dark"]) .react-datepicker__year-dropdown,
:is([data-theme="dark"]) .react-datepicker__month-dropdown,
:is([data-theme="dark"]) .react-datepicker__month-year-dropdown {
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid transparent;
}

:is([data-theme="dark"]) .react-datepicker__header {
    background-color: #191919;
  border-bottom: 1px solid transparent;
}

:is([data-theme="dark"]) .react-datepicker__time-container {
  border-left: 1px solid transparent;
}
:is([data-theme="dark"]) .react-datepicker__time-container .react-datepicker__time {
  background-color: #262626;
}
.react-datepicker__day--outside-month{
    color: #666 !important;
}
`;
