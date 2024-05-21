import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {
  MatChip, MatChipEvent,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow,
  MatChipSet
} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-upload-image',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatChipRemove,
    MatIcon,
    MatChip,
    MatButton,
    NgForOf,
    MatChipSet,
    NgIf,
    MatLabel,
    MatChipGrid,
    MatChipInput,
    MatChipRow,
  ],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css'
})
export class UploadImageComponent implements OnInit {
  form!: FormGroup;
  fileName: string | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  tagsSeparatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      model: ['', Validators.required],
      prompt: ['', Validators.required],
      negativePrompt: [''],
      technicalTags: [[]],
      image: [null, Validators.required]
    });
  }

  get tags(): FormArray {
    return this.form.get('technicalTags') as FormArray;
  }

  addTag($event: MatChipInputEvent): void {
    const tag = ($event.value || '').trim();
    if (tag) {
      this.tags.setValue([...this.tags?.value, tag]);
    }
    $event.chipInput!.clear();
  }

  removeTag($event: MatChipEvent): void {
    const index = this.tags.value.indexOf($event.chip.value);
    if (index >= 0) {
      this.tags.value.splice(index, 1);
    }
  }

  onImageSelect(event: Event): void {
    const image = event.currentTarget as HTMLInputElement;
    let images: FileList | null = image.files;
    if (images && images.length > 0) {
      const image = images[0];
      this.form.patchValue({image: image});

      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(image);
      this.fileName = image.name;
    }
  }

  onSubmit(): void {
    console.log(this.form.value);
  }
}
