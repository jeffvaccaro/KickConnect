import { DayPilot } from "@daypilot/daypilot-lite-angular";

export interface customDayPilotEventData extends DayPilot.EventData {
    existingClassId: number;
    existingClassName: string;
    existingClassDescription: string;
    isRepeat: boolean;
}
