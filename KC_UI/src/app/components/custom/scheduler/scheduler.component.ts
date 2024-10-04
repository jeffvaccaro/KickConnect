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

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DayPilotModule,RouterLink, MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar!: DayPilotCalendarComponent;
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

      // console.log('customDPEvents:', this.customDPEvents);
      const eventData = {
        ...args.e.data,
        existingClassId: args.e.data.existingClassId || 'defaultId',
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
      const updatedEvent = args.e.data;
      const eventIndex = this.customDPEvents.findIndex(event => event.id === updatedEvent.id);

      // Update the event data in the events array
      if (eventIndex !== -1) {
        this.customDPEvents[eventIndex] = updatedEvent;
        // args.e.data = updatedEvent;
      }
    },
    onEventResized: (args) => {
      const updatedEvent = args.e.data;
      const newStart = args.newStart;
      const newEnd = args.newEnd;

      const eventIndex = this.customDPEvents.findIndex(event => event.id === updatedEvent.id);

      // Update the event data in the events array
      if (eventIndex !== -1) {
        updatedEvent.duration = (newEnd.getTime() - newStart.getTime()) / (60 * 1000); // Calculate duration in minutes
        this.customDPEvents[eventIndex] = updatedEvent;
      }
      // console.log('Event resized:', updatedEvent);
    }

    
  };
  

  constructor(public dialog: MatDialog, private ds: DataService) {}

  ngAfterViewInit(): void {
    // console.log('Calendar initialized:', this.calendar);
    this.checkAndLoadEvents();
  }

  ngAfterViewChecked(): void {
    // Check again after view is fully initialized
    //this.checkAndLoadEvents();
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
    // console.log('Before dialog:', event);
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      width: '600px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: event ? {
        eventName: event.text || '',
        selectedDate: event.start.toString('yyyy-MM-dd') || '',
        selectedTime: event.start.toString('HH:mm') || '',
        duration: (event.end.getTime() - event.start.getTime()) / (60 * 1000) || 60,
        existingClassId: event.existingClassId || '',
        existingClassName: event.existingClassName || '',
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
  
        
        if (event) {
          // existing event update
          const updatedEvent = event;
          const eventIndex = this.customDPEvents.findIndex(event => event.id === updatedEvent.id);

          // Update the event data in the events array
          if (eventIndex !== -1) {
            let eDataItem: customDayPilotEventData = {
              id: DayPilot.guid(),
              start: startDate,
              end: endDate,
              text: result.eventName === "" ? result.existingClassName : result.eventName,
              existingClassId: result.existingClass !== undefined ? Number(result.existingClass) : 0,
              existingClassName: result.existingClassName || '',
              existingClassDescription: result.eventDescription || '',
              isRepeat: result.isRepeat
            };            
            this.customDPEvents[eventIndex] = eDataItem;
          }
        } else {
          // new event
          let eDataItem: customDayPilotEventData = {
            id: DayPilot.guid(),
            start: startDate,
            end: endDate,
            text: result.eventName === "" ? result.existingClassName : result.eventName,
            existingClassId: result.existingClass !== undefined ? Number(result.existingClass) : 0,
            existingClassName: result.existingClassName || '',
            existingClassDescription: result.eventDescription || '',
            isRepeat: result.isRepeat
          };
        
          this.customDPEvents.push(eDataItem);
          // console.log('New Event:', eDataItem);
        }
        
        this.calendar.control.update();
      }
    });
  }
  
}



