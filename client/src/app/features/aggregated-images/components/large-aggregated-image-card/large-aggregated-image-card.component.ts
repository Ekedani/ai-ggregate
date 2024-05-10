import {Component, Input} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgIf, SlicePipe} from "@angular/common";
import {
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {AggregatedImage} from "../../interfaces/aggregated-image";

@Component({
  selector: 'app-aggregated-image-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardImage,
    ImageFallbackDirective,
    MatCardHeader,
    MatIcon,
    MatCardContent,
    NgIf,
    MatCardTitle,
    MatCardSubtitle,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './large-aggregated-image-card.component.html',
  styleUrl: './large-aggregated-image-card.component.css'
})
export class LargeAggregatedImageCardComponent {
  @Input() image?: AggregatedImage;
}
