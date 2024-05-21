import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {
  MatChip,
  MatChipEvent,
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
import {ImagesService} from "../../../features/images/images.service";
import {ToastrService} from "ngx-toastr";
import {MatDialogRef} from "@angular/material/dialog";

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
    MatSuffix,
  ],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.css'
})
export class UploadImageComponent implements OnInit {
  form!: FormGroup;
  fileName: string | null = null;
  imageSrc: string | ArrayBuffer | null = null;
  tagsSeparatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(
    private fb: FormBuilder,
    private imageService: ImagesService,
    private toastrService: ToastrService,
    private dialogRef: MatDialogRef<UploadImageComponent>,
  ) {
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
    if (this.form.valid) {
      this.imageService.uploadImage(this.form.value).subscribe({
          next: () => {
            this.toastrService.success('Image uploaded successfully');
            this.dialogRef.close();
          },
          error: error => {
            this.toastrService.error('Error uploading image');
            this.dialogRef.close();
          }
        }
      );
    }
  }
}
