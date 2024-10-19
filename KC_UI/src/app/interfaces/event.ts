export interface IEvent {
    eventId: number;
    eventName: string;
    eventDescription: string;
    isReservation: boolean;
    maxReservationCount: number;
    isCostToAttend: boolean;
    costToAttend: number;
    isActive: boolean;
    createdBy: string,
    accountId?: number
}
