import { Timestamp } from "firebase/firestore";

export function setDateToMidnight(input?: Timestamp): Timestamp | undefined {
    if (!input) return input;
    const date = input.toDate();
    date.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(date);
}
