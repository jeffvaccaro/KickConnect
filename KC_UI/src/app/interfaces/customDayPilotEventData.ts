import { DayPilot } from "@daypilot/daypilot-lite-angular";

export interface ICustomDayPilotEventData extends DayPilot.EventData {
    existingClassId: number;
    existingClassName: string;
    existingClassValue: string;
    existingClassDescription: string;
    isRepeat: boolean;
    scheduleId?: number;
    accountId?: number;
    isActive: boolean;
    locationValues: number;
}
