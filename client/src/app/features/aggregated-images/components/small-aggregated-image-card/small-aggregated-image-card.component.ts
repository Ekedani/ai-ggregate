import {Component, Input} from '@angular/core';
import {MatCard, MatCardContent, MatCardImage} from "@angular/material/card";
import {MatCheckbox} from "@angular/material/checkbox";
import {AggregatedImage} from "../../interfaces/aggregated-image";
import {NgIf, SlicePipe} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";

@Component({
  selector: 'app-small-aggregated-image-card',
  standalone: true,
  imports: [
    MatCard,
    MatCheckbox,
    MatCardContent,
    MatCardImage,
    NgIf,
    SlicePipe,
    ImageFallbackDirective
  ],
  templateUrl: './small-aggregated-image-card.component.html',
  styleUrl: './small-aggregated-image-card.component.css'
})
export class SmallAggregatedImageCardComponent {
  @Input() image?: AggregatedImage;
}
