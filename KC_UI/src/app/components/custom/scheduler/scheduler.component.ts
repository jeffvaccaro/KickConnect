import { Component, ViewChild, OnInit, AfterViewInit, AfterViewChecked, Inject } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AddEditDialogComponent } from './add-edit-dialog/add-edit-dialog.component';
import { customDayPilotEventData } from '../../../interfaces/customDayPilotEventData';
import { SchedulerService } from '../../../services/scheduler.service';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DayPilotModule,RouterLink, MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar!: DayPilotCalendarComponent;
  private eventDataManager = createEventData(); 


  //customDPEvents: DayPilot.EventData[] = [];
  customDPEvents: customDayPilotEventData[] = [];


  // Define the configCalendar property here
  configCalendar: DayPilot.CalendarConfig = {
    viewType: 'Week',
    onTimeRangeSelected: async (args) => {
      const modal = await DayPilot.Modal.prompt('Create a new event:', 'Event 1');
      const dp = args.control;
      dp.clearSelection();
      if (!modal.result) {
        return;
      }
      dp.events.add(new DayPilot.Event({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: modal.result
      }));
    },
    onEventClick: (args) => {
      // console.log('args.e.data:', args.e.data);
      const updatedEvent = args.e.data;
      const eventIndex = this.customDPEvents.findIndex(event => event.id === updatedEvent.id);
      this.customDPEvents[eventIndex] = updatedEvent;

      const eventData = {
        ...args.e.data,
        existingClassId: args.e.data.existingClassId || 'defaultId',
        existingClassValue: args.e.data.existingClassValue,
        existingClassName: args.e.data.existingClassName || 'defaultName',
        eventDescription: args.e.data.eventDescription || '',
        eventName: args.e.data.text || '',
        selectedDate: args.e.data.start.toString('yyyy-MM-dd'),
        selectedTime: args.e.data.start.toString('HH:mm'),
        duration: (args.e.data.end.getTime() - args.e.data.start.getTime()) / (60 * 1000),
        isRepeat: args.e.data.isRepeat || false,
        isActive: args.e.data.isActive || false
      };
    
      // console.log('onEventClick', eventData);  // Log to verify data
      this.openAddEventDialog('300ms', '100ms', eventData);
    },
    
    onEventMoved: (args) => {
      this.eventDataManager.updateEvent(args.e.data);
    },
    onEventResized: (args) => {
      const updatedEvent = args.e.data;
      updatedEvent.duration = (args.newEnd.getTime() - args.newStart.getTime()) / (60 * 1000); // Calculate duration in minutes
      this.eventDataManager.updateEvent(updatedEvent);
    }
  };
  
  constructor(public dialog: MatDialog, private ds: DataService, private schedulerService: SchedulerService) {}

  ngAfterViewInit(): void {
    this.checkAndLoadEvents();
  }

  ngAfterViewChecked(): void {
    // Check again after view is fully initialized
  }

  checkAndLoadEvents(): void {
    if (this.calendar && this.calendar.control) {
      this.loadEvents();
    }
  }

  // Example subscription


  loadEvents(): void {
    // const from = this.calendar.control.visibleStart();
    // const to = this.calendar.control.visibleEnd();
  
    // this.customDPEvents = this.ds.getEvents2(from, to).map(event => ({
    //   ...event,
    //   existingClassId: event.existingClassId || 'defaultId', // Ensure default value
    //   existingClassName: event.existingClassName || 'defaultName'
    // }));
    // console.log('events:', this.customDPEvents);
    // this.calendar.control.update();
  }
  
  openAddEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, event?: any): void {
    const eventDataManager = createEventDataManager(); // Initialize the closure
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      width: '600px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: event ? {
        eventName: event.text || '',
        selectedDate: event.start.toString('yyyy-MM-dd') || '',
        selectedTime: event.start.toString('HH:mm') || '',
        duration: (event.end.getTime() - event.start.getTime()) / (60 * 1000) || 60,
        existingClassId: event.existingClassId || 'blank?',
        existingClassName: event.existingClassName || '',
        existingClassValue: event.existingClassValue,
        existingClassDescription: event.existingClassDescription || '',
        isRepeat: event.isRepeat || false,
        isActive: event.isActive || false
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
  
        let eDataItem;
  
        if (event) {
          const eventIndex = this.customDPEvents.findIndex(evt => evt.id === event.id);
          if (eventIndex !== -1) {
            eDataItem = eventDataManager.updateEvent(event, result, startDate, endDate);
            this.customDPEvents[eventIndex] = eDataItem;
          }
        } else {
          eDataItem = eventDataManager.createEvent(result, startDate, endDate);
          this.customDPEvents.push(eDataItem);
        }
  
        console.log('calling service', eDataItem);
  
        this.schedulerService.addSchedule(eDataItem).subscribe({
          next: response => {
            console.log('Schedule added:', response);
          },
          error: error => {
            console.error('Error adding schedule:', error);
          }
        });
  
        this.calendar.control.update();
      }
    });
  }
  
  
}

function createEventData() {
  let customDPEvents: customDayPilotEventData[] = [];

  return {
    addEvent(event: customDayPilotEventData) {
      customDPEvents.push(event);
    },
    updateEvent(updatedEvent: customDayPilotEventData) {
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
    createEvent(result: any, startDate: DayPilot.Date, endDate: DayPilot.Date): customDayPilotEventData {
      return {
        id: DayPilot.guid(),
        start: startDate,
        end: endDate,
        text: result.eventName === "" ? result.existingClassName : result.eventName,
        existingClassId: result.existingClassValue !== undefined ? Number(result.existingClassValue) : 0,
        existingClassName: result.existingClassName || '',
        existingClassValue: result.existingClassValue,
        existingClassDescription: result.existingClassDescription || '',
        isRepeat: result.isRepeat
      };
    },
    updateEvent(existingEvent: customDayPilotEventData, result: any, startDate: DayPilot.Date, endDate: DayPilot.Date): customDayPilotEventData {
      return {
        ...existingEvent,
        start: startDate,
        end: endDate,
        text: result.eventName === "" ? result.existingClassName : result.eventName,
        existingClassId: result.existingClassValue !== undefined ? Number(result.existingClassValue) : 0,
        existingClassName: result.existingClassName || '',
        existingClassValue: result.existingClassValue,
        existingClassDescription: result.existingClassDescription || '',
        isRepeat: result.isRepeat
      };
    }
  };
}