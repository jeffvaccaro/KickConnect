import { Component, ViewChild, OnInit, AfterViewInit, AfterViewChecked, Inject } from '@angular/core';
import { DayPilot, DayPilotCalendarComponent, DayPilotModule } from '@daypilot/daypilot-lite-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { AddEditDialogComponent } from './add-edit-dialog/add-edit-dialog.component';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [DayPilotModule,RouterLink, MatCardModule, MatButtonModule, MatMenuModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements AfterViewInit {
  @ViewChild('calendar') calendar!: DayPilotCalendarComponent;
  events: DayPilot.EventData[] = [];

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
      this.openAddEventDialog('300ms', '100ms', args.e.data);
    }
  };
  

  constructor(public dialog: MatDialog, private ds: DataService) {}

  ngAfterViewInit(): void {
    console.log('Calendar initialized:', this.calendar);
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
    const from = this.calendar.control.visibleStart();
    const to = this.calendar.control.visibleEnd();

    // Example subscription
    this.events = this.ds.getEvents2(from, to);
    console.log('events:', this.events);
    this.calendar.control.update();


    console.log('Calendar Updated:', this.calendar);
  }

  openAddEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, event?: any): void {
    const dialogRef = this.dialog.open(AddEditDialogComponent, {
      width: '600px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: event ? {
        eventName: event.text,
        selectedDate: event.start.toString('yyyy-MM-dd'),
        selectedTime: event.start.toString('HH:mm'),
        duration: (event.end.getTime() - event.start.getTime()) / (60 * 1000) // Calculate duration in minutes
      } : {}
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Event Data:', result);
        const startDateTime = new Date(`${result.selectedDate}T${result.selectedTime}`);
        const localOffset = startDateTime.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localStartDateTime = new Date(startDateTime.getTime() - localOffset);
        const startDate = new DayPilot.Date(localStartDateTime);
        let endDate;
  
        if (result.duration === 'allDay') {
          endDate = new DayPilot.Date(new Date(localStartDateTime.getTime() + 24 * 60 * 60 * 1000)); // All day event
        } else {
          endDate = new DayPilot.Date(new Date(localStartDateTime.getTime() + result.duration * 60 * 1000)); // Use provided duration
        }
  
        console.log('Start Date:', startDate);
        console.log('End Date:', endDate);
  
        if (event) {
          // Edit existing event
          event.start = startDate;
          event.end = endDate;
          event.text = result.eventName;
        } else {
          // Add new event
          this.events.push({
            id: DayPilot.guid(),
            start: startDate,
            end: endDate,
            text: result.eventName,
            resource: "R1"
          });
        }
        this.calendar.control.update();
      }
    });
  }
  
  
  
 
}



