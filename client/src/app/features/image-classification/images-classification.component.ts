import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ImagesClassificationService} from "./images-classification.service";
import {JsonPipe, NgIf} from "@angular/common";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {ToastrService} from "ngx-toastr";
import {MatList, MatListItem} from "@angular/material/list";

@Component({
  selector: 'app-images-classification',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    JsonPipe,
    MatCardHeader,
    MatCard,
    MatCardContent,
    MatLabel,
    MatFormField,
    MatOption,
    MatSelect,
    MatButton,
    MatCardTitle,
    MatInput,
    MatIcon,
    MatIconButton,
    MatSuffix,
    MatListItem,
    MatList,
    MatCardSubtitle
  ],
  templateUrl: './images-classification.component.html',
  styleUrl: './images-classification.component.css'
})
export class ImagesClassificationComponent {
  form: FormGroup;
  imageSrc: string | ArrayBuffer | null = null;
  classificationResult: any = null;
  fileName?: string;

  constructor(
    private formBuilder: FormBuilder,
    private classificationService: ImagesClassificationService,
    private toastrService: ToastrService
  ) {
    this.form = this.formBuilder.group({
      image: [null],
      modelVersion: ['resnet34_image_classifier_v4']
    });
  }

  onFileSelect(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let files: FileList | null = element.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.form.patchValue({image: file});

      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
      };
      reader.readAsDataURL(file);
      this.fileName = file.name;
    }
  }

  onSubmit(): void {
    if (!this.form.get('image')?.value) {
      this.toastrService.error('Please, select the image', 'Validation Error')
      return;
    }

    const formData = new FormData();
    formData.append('file', this.form.get('image')?.value);
    const model = this.form.get('modelVersion')?.value;
    this.classificationService.classifyImage(model, formData).subscribe({
      next: (result) => {
        this.classificationResult = result;
      },
      error: (error) => {
        this.toastrService.error(error.data, 'Помилка класифікації')
      }
    });
  }
}
