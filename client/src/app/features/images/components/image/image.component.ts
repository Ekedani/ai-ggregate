import {Component} from '@angular/core';
import {ImagesService} from "../../images.service";
import {ActivatedRoute} from "@angular/router";
import {AiGeneratedImage} from "../../interfaces/ai-generated-image";
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent, MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatAnchor} from "@angular/material/button";
import {DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [
    MatCardActions,
    MatAnchor,
    NgIf,
    MatCardImage,
    MatCardContent,
    MatCardSubtitle,
    MatCardAvatar,
    MatCardTitle,
    MatCard,
    MatCardHeader,
    DatePipe,
    DecimalPipe,
    MatChip,
    NgForOf,
    MatChipSet,
    MatIcon
  ],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  image!: AiGeneratedImage;

  constructor(
    private readonly imagesService: ImagesService,
    private readonly route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.imagesService.getImage(id).subscribe(image => {
        this.image = image;
      });
    });
  }

  getImgSrc(image: AiGeneratedImage): string {
    return this.imagesService.getImageUrl(image);
  }
}
