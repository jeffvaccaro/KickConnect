import { Time } from "@angular/common";

export interface ISchedule {
    classId: number,
    className: string,
    classDescription: string,
    day: number,
    startTime: string,
    endTime: string,
    isRepeat: boolean,
    isActive: boolean
}
