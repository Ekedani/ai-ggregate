import {Component} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {AggregatedImagesService} from "../../aggregated-images.service";
import {NgxPaginationModule} from "ngx-pagination";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";

@Component({
  selector: 'app-aggregated-image-list',
  standalone: true,
  imports: [
    MatPaginator,
    MatCard,
    MatCardHeader,
    MatIcon,
    NgForOf,
    MatCardImage,
    MatCardContent,
    MatChip,
    MatChipSet,
    MatCardSubtitle,
    MatCardTitle,
    NgxPaginationModule,
    NgIf,
    DatePipe,
    ImageFallbackDirective
  ],
  templateUrl: './aggregated-image-list.component.html',
  styleUrl: './aggregated-image-list.component.css'
})
export class AggregatedImageListComponent {
  images: any[] = [];
  totalImages = 0;
  pageSize = 100;

  constructor(private aggregatedImagesService: AggregatedImagesService) {
  }

  ngOnInit() {
    this.loadImages();
  }

  loadImages(pageIndex = 1) {
    this.aggregatedImagesService.getAggregatedImages(pageIndex, this.pageSize).subscribe(data => {
      this.images = data.images;
      this.totalImages = data.total;
    });
  }

  changePage(event: any) {
    this.loadImages(event.pageIndex);
  }
}
