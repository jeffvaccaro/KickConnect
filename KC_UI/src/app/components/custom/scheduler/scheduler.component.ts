import { Component, ViewChild, OnInit, AfterViewInit, AfterViewChecked, Inject } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AddEditDialogComponent } from './add-edit-dialog/add-edit-dialog.component';
import { ICustomDayPilotEventData } from '../../../interfaces/customDayPilotEventData';
import { ClassService } from '../../../services/class.service';
import { SchedulerService } from '../../../services/scheduler.service';
import { IClass } from '../../../interfaces/classes';
import { ISchedule } from '../../../interfaces/schedule';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DayPilotModule,RouterLink, MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar!: DayPilotCalendarComponent;
  private createEventDataManager = createEventData(); 
  
  class : IClass;
  scheduleList : ISchedule[] = [];
  customDPEvents: ICustomDayPilotEventData[] = [];


  // Define the configCalendar property here
  configCalendar: DayPilot.CalendarConfig = {
    viewType: 'Week',
    onTimeRangeSelected: args => {
      // Override default behavior by not calling any default function
      // Do nothing here to prevent the default add event dialog
    },
    onEventClick: (args) => {
      const updatedEvent = args.e.data;
      const eventIndex = this.customDPEvents.findIndex(event => event.id === updatedEvent.id);
      const eventData = {
        ...args.e.data,
        accountId: args.e.data.accountId,
        scheduleMainId: args.e.data.scheduleMainId,
        existingClassId: args.e.data.existingClassId || 'defaultId',
        existingClassValue: args.e.data.existingClassValue,
        existingClassName: args.e.data.existingClassName || 'defaultName',
        eventDescription: args.e.data.eventDescription || '',
        eventName: args.e.data.text || '',
        selectedDate: args.e.data.start.toString('yyyy-MM-dd'),
        day: args.e.data.day,
        selectedTime: args.e.data.start.toString('HH:mm'),
        duration: (args.e.data.end.getTime() - args.e.data.start.getTime()) / (60 * 1000),
        locationValues: args.e.data.locationValues !== undefined ? args.e.data.locationValues : -99, 
        reservationCount: args.e.data.reservationCount,
        costToAttend: args.e.data.costToAttend,
        isRepeat: args.e.data.isRepeat || false,
        isActive: args.e.data.isActive || false,
        isReservation: args.e.data.isReservation,
        isCostToAttend: args.e.data.isCostToAttend,        
      };
    
      this.openAddEventDialog('300ms', '100ms', false, eventData);
    },
    
    onEventMoved: (args) => {
      const updatedEvent = {
        ...args.e.data,
        start: new DayPilot.Date(args.newStart), // Ensure start is a Date object
        end: new DayPilot.Date(args.newEnd) // Ensure end is a Date object
    };
      // this.createEventDataManager.updateEvent(args.e.data);
      this.openAddEventDialog('300ms', '100ms', false, updatedEvent);
    },
    onEventResized: (args) => {
      const updatedEvent = {
        ...args.e.data,
        duration: (args.newEnd.getTime() - args.newStart.getTime()) / (60 * 1000)
    };

      updatedEvent.duration = (args.newEnd.getTime() - args.newStart.getTime()) / (60 * 1000); // Calculate duration in minutes
      // this.createEventDataManager.updateEvent(updatedEvent);
      this.openAddEventDialog('300ms', '100ms', false, updatedEvent);
    }
    
  };
  
  constructor(public dialog: MatDialog, private ds: DataService, private schedulerService: SchedulerService, 
    private classService: ClassService, private snackBarService: SnackbarService) {
    
  }
  ngOnInit():void{
    this.loadEvents()
  }

  ngAfterViewInit(): void {
    if (this.calendar && this.calendar.control) {
      this.calendar.control.events.list = this.customDPEvents;
      this.calendar.control.update();
    }
  }

  checkAndLoadEvents(): void {
    if (this.calendar && this.calendar.control) {
      this.loadEvents();
    }
  }  
  loadEvents(): void {
    this.schedulerService.getSchedules().subscribe((data: ISchedule[]) => {
      console.log('Fetched schedules:', data); // Log fetched data
  
      this.scheduleList = data;
  
      const currentDate = new Date(); // Get the current date
      const startOfWeek = currentDate.getDate() - currentDate.getDay(); // Get the start of the current week (Sunday)
  
      this.customDPEvents = this.scheduleList.map(schedule => {
        const eventDate = new Date(currentDate);
        eventDate.setDate(startOfWeek + schedule.day); // Calculate the exact date based on dayNumber
        const formattedDate = this.formatDate(eventDate.toISOString()); // Format the calculated date
      
        return {
          accountId: schedule.accountId,
          scheduleMainId: schedule.scheduleMainId,
          id: schedule.classId,
          text: schedule.className,
          start: `${formattedDate}T${this.formatTime(schedule.startTime)}`,
          end: `${formattedDate}T${this.formatTime(schedule.endTime)}`,
          resource: schedule.classId,
          existingClassId: schedule.classId,
          existingClassName: schedule.className,
          existingClassValue: String(schedule.classId),
          existingClassDescription: schedule.classDescription,
          reservationCount: schedule.reservationCount,
          costToAttend: schedule.costToAttend,
          selectedDate: schedule.selectedDate,
          selectedTime: schedule.selectedTime,
          day: schedule.day,
          duration: schedule.duration,
          isRepeat: schedule.isRepeat,
          isActive: schedule.isActive,
          isReservation: schedule.isReservation,
          isCostToAttend: schedule.isCostToAttend
        };
      });
  
      if (this.calendar && this.calendar.control) {
        this.calendar.control.events.list = this.customDPEvents; // Bind events to calendar
        this.calendar.control.update(); // Ensure the calendar updates
      }
    });
  }
  
  formatDate(date: string): string {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  formatTime(time: string): string {
    const [hoursMinutes, modifier] = time.split(' ');
    let [hours, minutes] = hoursMinutes.split(':').map(Number);
  
    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
  
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`; // Correct time format
  }

  openAddEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, isNew: boolean, event?: any): void {
    const eventDataManager = createEventDataManager();
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      width: '600px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: event ? {
        accountId: event.accountId,
        scheduleMainId: event.scheduleMainId,
        eventName: event.text || '',
        selectedDate: event.start.toString('yyyy-MM-dd') || '',
        selectedTime: event.start.toString('HH:mm') || '',
        duration: (event.end.getTime() - event.start.getTime()) / (60 * 1000) || 60,
        existingClassId: event.existingClassId || 'blank?',
        existingClassName: event.existingClassName || '',
        existingClassValue: event.existingClassValue,
        existingClassDescription: event.existingClassDescription || '',
        isRepeat: event.isRepeat || false,
        isActive: event.isActive || false,
        locationValues: event.locationValues,
        isReservation: event.isReservation,
        reservationCount: event.reservationCount,
        isCostToAttend: event.isCostToAttend,          
        costToAttend: event.costToAttend,
        isNew: isNew        
      } : {}
    });
      
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedDate = new Date(result.selectedDate);
        const [time, modifier] = result.selectedTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
    
        if (modifier === 'PM' && hours !== 12) {
          hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
          hours = 0;
        }
    
        selectedDate.setHours(hours, minutes);
        const localOffset = selectedDate.getTimezoneOffset() * 60000;
        const localStartDateTime = new Date(selectedDate.getTime() - localOffset);
        const startDate = new DayPilot.Date(localStartDateTime);
        const endDate = new DayPilot.Date(new Date(localStartDateTime.getTime() + result.duration * 60 * 1000));
    
        let eDataItem: ICustomDayPilotEventData;
    
        if (event) {
          // Ensure eventDataManager.updateEvent updates correctly
          const eventIndex = this.customDPEvents.findIndex(evt => evt.scheduleMainId === event.scheduleMainId);

          if (eventIndex !== -1) {
            eDataItem = eventDataManager.updateEvent(event, result, startDate, endDate);
           
            // Update the event in customDPEvents
            this.customDPEvents[eventIndex] = eDataItem;
            
            // Update the backend and refresh UI
            this.schedulerService.updateScheduleEvent(eDataItem).subscribe({
              next: () => {
                this.customDPEvents[eventIndex] = eDataItem;
              },
              error: (error) => console.error('Error occurred while updating schedule event:', error)
            });
          }
        } else {
          eDataItem = eventDataManager.createEvent(result, startDate, endDate);
          if (eDataItem.existingClassValue === "newEventClass") {

            this.class = {
              classId: 0,
              className: result.eventName,
              classDescription: result.eventDescription,
              isActive: true,
              createdBy: '',
              accountId: result.accountId
            };
          
            this.classService.addClass(this.class).subscribe({
              next: (classId) => {
                const modifiedResult = { ...result, classId };
                this.schedulerService.addScheduleEvent(modifiedResult).subscribe({
                  next: (scheduleMainId) => {scheduleMainId
                    eDataItem.existingClassDescription = result.eventDescription;
                    this.customDPEvents.push({ ...eDataItem, scheduleMainId });
                  },
                  error: (error) => console.error('Error occurred while adding schedule event:', error)
                });
              },
              error: (error) => console.error('Error occurred while adding class:', error)
            });
          } else {
            // Existing Class          
            const modifiedResult = { ...result };
            this.schedulerService.addScheduleEvent(modifiedResult).subscribe({
              next: (scheduleMainId) => {
                eDataItem.existingClassDescription = modifiedResult.eventDescription;
                console.log('eDataItem',eDataItem);
                this.customDPEvents.push({ ...eDataItem, scheduleMainId });
              },
              error: (error) => console.error('Error occurred while adding schedule event:', error)
            });
          }
        }
      }
      this.calendar.control.update();
    });
  }
}

function createEventData() {
  let customDPEvents: ICustomDayPilotEventData[] = [];

  return {
    addEvent(event: ICustomDayPilotEventData) {
      customDPEvents.push(event);
    },
    updateEvent(updatedEvent: ICustomDayPilotEventData) {
      const eventIndex = customDPEvents.findIndex(event => event.id === updatedEvent.id);
      if (eventIndex !== -1) {
        customDPEvents[eventIndex] = updatedEvent;
      }
    },
    getEvents() {
      return customDPEvents;
    }
  };
}

function createEventDataManager() {
  return {
    createEvent(result: any, startDate: DayPilot.Date, endDate: DayPilot.Date): ICustomDayPilotEventData {
      return {
        id: DayPilot.guid(),
        start: startDate,
        end: endDate,
        text: result.eventName === "" ? result.existingClassName : result.eventName,
        existingClassId: result.existingClassValue !== undefined ? Number(result.existingClassValue) : 0,
        existingClassName: result.existingClassName || '',
        existingClassValue: result.existingClassValue,
        existingClassDescription: result.existingClassDescription || '',
        isRepeat: result.isRepeat,
        isActive: true,
        isReservation: result.isReservation,
        reservationCount: result.reservationCount,
        isCostToAttend: result.isCostToAttend,          
        costToAttend: result.costToAttend,
        selectedDate: result.selectedDate,
        selectedTime: result.selectedTime,
        day: result.dayNumber,
        duration: result.duration
      };
    },
    updateEvent(existingEvent: ICustomDayPilotEventData, result: any, startDate: DayPilot.Date, endDate: DayPilot.Date): ICustomDayPilotEventData {
        console.log('Existing event data:', existingEvent);
        console.log('Result data:', result);
      return {
        ...existingEvent,
        start: startDate,
        end: endDate,
        text: result.eventName === "" ? result.existingClassName : result.eventName,
        existingClassId: result.existingClassValue !== undefined ? Number(result.existingClassValue) : 0,
        existingClassName: result.existingClassName || '',
        existingClassValue: result.existingClassValue,
        existingClassDescription: result.existingClassDescription || '',
        isRepeat: result.isRepeat,
        isActive: true,
        isReservation: result.isReservation,
        reservationCount: result.reservationCount,
        isCostToAttend: result.isCostToAttend,
        costToAttend: result.costToAttend,
        selectedTime: result.selectedTime,
        selectedDate: result.selectedDate,
        day: result.dayNumber,
        duration: result.duration

      };
    }    
  };
}