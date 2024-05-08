import {Component} from '@angular/core';
import {ImagesService} from "../../services/images.service";
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {AiGeneratedImage} from "../../models/ai-generated-image";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {MatChip, MatChipInput} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";

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
  ],
  templateUrl: './image-search.component.html',
  styleUrl: './image-search.component.css'
})
export class ImageSearchComponent {
  images: AiGeneratedImage[] = [];
  searchForm: FormGroup;

  constructor(private imageService: ImagesService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
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
      limit: [100]
    });
  }

  searchImages() {
    this.imageService.searchImages(this.searchForm.value)
      .subscribe({
        next: (data) => this.images = data,
        error: (error) => console.error(error)
      });
  }
}
