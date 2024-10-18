import { DayPilot } from "@daypilot/daypilot-lite-angular";

export interface ICustomDayPilotEventData extends DayPilot.EventData {
    accountId?: number;
    scheduleMainId?: number;
    existingClassId: number;
    existingClassName: string;
    existingClassValue: string;
    existingClassDescription: string;
    isRepeat: boolean;
    scheduleId?: number;
    isActive: boolean;
    selectedDate: Date;
    selectedTime: string;
    day: number;
    duration: number;
    isReservation: boolean,
    reservationCount: number,
    isCostToAttend: boolean,    
    costToAttend: number
}
