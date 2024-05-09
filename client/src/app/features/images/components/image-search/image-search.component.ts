import {Component} from '@angular/core';
import {ImagesService} from "../../images.service";
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
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
import {ToastrService} from "ngx-toastr";

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
  searchQueryForm: FormGroup;
  showAllFields = false;
  tagsSeparatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private imageService: ImagesService,
    private fb: FormBuilder,
    private toastrService: ToastrService
  ) {
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

  ngOnInit() {
    this.searchImages();
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
    const imagesSearchQuery = this.getImagesSearchQuery();
    this.imageService.searchImages(imagesSearchQuery)
      .subscribe({
        error: (error) => this.toastrService.error(error.message, 'Error while searching images')
      });
  }

  private getImagesSearchQuery(): { [key: string]: string | string[] } {
    return Object.entries(this.searchQueryForm.value)
      .filter(([key, value]) => {
        return value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);
      })
      .reduce((obj: { [key: string]: string | string[] }, [key, value]) => {
        obj[key] = Array.isArray(value) ? value.map(item => String(item)) : String(value);
        return obj;
      }, {});
  }
}
