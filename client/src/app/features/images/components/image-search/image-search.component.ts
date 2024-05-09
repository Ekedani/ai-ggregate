import {Component} from '@angular/core';
import {ImagesService} from "../../images.service";
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AiGeneratedImage} from "../../models/ai-generated-image";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {
  MatChip,
  MatChipEvent,
  MatChipGrid,
  MatChipInput,
  MatChipInputEvent,
  MatChipRemove,
  MatChipRow
} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";

@Component({
  selector: 'app-image-search',
  standalone: true,
  imports: [
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgForOf,
    MatChipInput,
    MatIcon,
    MatChip,
    NgIf,
    MatSelect,
    MatOption,
    MatChipGrid,
    MatChipRow,
    MatChipRemove,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
  ],
  templateUrl: './image-search.component.html',
  styleUrl: './image-search.component.css'
})
export class ImageSearchComponent {
  images: AiGeneratedImage[] = [];
  searchQueryForm: FormGroup;

  showAllFields = false;
  tagsSeparatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private imageService: ImagesService, private fb: FormBuilder) {
    this.searchQueryForm = this.fb.group({
      prompt: [''],
      negativePrompt: [''],
      model: [''],
      createdAfter: [null],
      createdBefore: [null],
      provider: [''],
      format: [''],
      contentTags: [[]],
      technicalTags: [[]],
      page: [1],
      limit: [100],
    });
  }

  toggleAdditionalFieldsVisibility(): void {
    this.showAllFields = !this.showAllFields;
  }

  addTag(event: MatChipInputEvent, tagsType: "contentTags" | "technicalTags") {
    const tag = (event.value || '').trim();
    if (tag) {
      const tags = this.searchQueryForm.get(tagsType);
      tags?.setValue([...tags?.value, tag]);
    }
    event.chipInput!.clear();

  }

  removeTag(event: MatChipEvent, tagsType: "contentTags" | "technicalTags") {
    const tags = this.searchQueryForm.get(tagsType);
    const index = tags?.value.indexOf(event.chip.value);
    if (index >= 0) {
      tags?.value.splice(index, 1);
    }
  }

  searchImages() {
    console.log(this.searchQueryForm.value);
    this.imageService.searchImages(this.searchQueryForm.value)
      .subscribe({
        next: (data) => this.images = data,
        error: (error) => console.error(error)
      });
  }
}
