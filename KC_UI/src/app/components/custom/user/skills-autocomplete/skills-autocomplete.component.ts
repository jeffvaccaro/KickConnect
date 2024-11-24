import { Component, OnInit, inject, computed, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SkillService } from '../../../../services/skill.service';
import { SnackbarService } from '../../../../services/snackbar.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-skills-autocomplete',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatChipsModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatIconModule, NgFor],
  templateUrl: './skills-autocomplete.component.html',
  styleUrls: ['./skills-autocomplete.component.scss']
})
export class SkillsAutocompleteComponent implements OnInit {
  @Output() skillCollection = new EventEmitter<string[]>();

  skillsArr: any[] = [];
  currentSkillControl = new FormControl('');
  skillsControl = new FormControl<string[]>([]);
    
  constructor(private skillService: SkillService, private snackBarService: SnackbarService) { }

  ngOnInit(): void {
    this.skillService.getAllSkills().subscribe({
      next: response => {
        this.skillsArr = response;
      },
      error: error => {
        this.snackBarService.openSnackBar('Error fetching Skills:' + error.message, '', []);
      }
    });
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  get filteredSkills() {
    const currentSkill = this.currentSkillControl.value?.toLowerCase() || '';
    return currentSkill
      ? this.skillsArr.filter(skill => skill.skillName.toLowerCase().includes(currentSkill))
      : this.skillsArr.slice();
  }

  readonly announcer = inject(LiveAnnouncer);

  trackBySkill(index: number, skill: any): number {
    return skill.skillId;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const currentSkills = this.skillsControl.value || [];

    if (value && !currentSkills.includes(value)) {
        this.skillsControl.setValue([...(currentSkills || []), value]);
        this.skillCollection.emit(this.skillsControl.value ?? []);
    }

    // Clear the input value using the MatChipInput instance
    if (event.chipInput) {
        event.chipInput.clear();
    }

    this.currentSkillControl.setValue('');
  }


  remove(skill: string): void {
    const currentSkills = this.skillsControl.value || [];

    this.skillsControl.setValue(currentSkills.filter(s => s !== skill));
    this.skillCollection.emit(this.skillsControl.value ?? []);
    this.announcer.announce(`Removed ${skill}`);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const currentSkills = this.skillsControl.value || [];
    const value = event.option.viewValue;

    if (!currentSkills.includes(value)) {
        this.skillsControl.setValue([...currentSkills, value]);
        this.skillCollection.emit(this.skillsControl.value ?? []);
    }

    this.currentSkillControl.setValue('');
    event.option.deselect();
  }

}
