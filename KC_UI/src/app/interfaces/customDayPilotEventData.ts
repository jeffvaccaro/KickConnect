import { DayPilot } from "@daypilot/daypilot-lite-angular";

export interface customDayPilotEventData extends DayPilot.EventData {
    existingClassId: number;
    existingClassName: string;
    existingClassValue: string;
    existingClassDescription: string;
    isRepeat: boolean;
    scheduleId?: number;
}
