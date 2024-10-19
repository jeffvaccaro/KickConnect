import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomFormValidationService {
  setupConditionalValidators(formGroup: FormGroup): void {
    const eventNameControl = formGroup.get('eventName');
    const eventDescriptionControl = formGroup.get('eventDescription');

    formGroup.get('existingClassValue')?.valueChanges.subscribe(value => {
      if (value === 'newEventClass') {
        eventNameControl?.setValidators([Validators.required]);
        eventDescriptionControl?.setValidators([Validators.required]);
      } else {
        eventNameControl?.clearValidators();
        eventDescriptionControl?.setValidators([Validators.required]);
      }
      eventNameControl?.updateValueAndValidity();
      eventDescriptionControl?.updateValueAndValidity();
    });

    formGroup.get('isReservation')?.valueChanges.subscribe(value => {
      const reservationCountControl = formGroup.get('reservationCount');
      if (value) {
        reservationCountControl?.setValidators([Validators.required]);
      } else {
        reservationCountControl?.clearValidators();
      }
      reservationCountControl?.updateValueAndValidity();
    });

    formGroup.get('isCostToAttend')?.valueChanges.subscribe(value => {
      const costToAttendControl = formGroup.get('costToAttend');
      if (value) {
        costToAttendControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        costToAttendControl?.clearValidators();
      }
      costToAttendControl?.updateValueAndValidity();
    });

    formGroup.get('selectedDate')?.setValidators([Validators.required]);
    formGroup.get('selectedTime')?.setValidators([Validators.required]);
    formGroup.get('duration')?.setValidators([Validators.required]);

    // Validate eventDescriptionControl to not allow blanks
    eventDescriptionControl?.valueChanges.subscribe(() => {
      if (!eventDescriptionControl?.value || eventDescriptionControl.value.trim() === "") {
        eventDescriptionControl?.setErrors({ required: true });
      } else {
        eventDescriptionControl?.setErrors(null);
      }
    });

    formGroup.updateValueAndValidity();
  }

  updateFormControlStates(form: FormGroup, isPopulated: boolean) {
    const controlsToUpdate = ['existingClassValue', 'existingClassName', 'eventName', 'eventDescription', 'isReservation', 'isCostToAttend', 'reservationCount', 'costToAttend'];
    controlsToUpdate.forEach(control => {
        if (isPopulated) {
          form.get(control)?.disable();
        } else {
          form.get(control)?.enable();
        }
    });
}

}
