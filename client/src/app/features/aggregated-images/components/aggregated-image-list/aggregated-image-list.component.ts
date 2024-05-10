import {Component} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {NgForOf} from "@angular/common";
import {AggregatedImagesService} from "../../aggregated-images.service";
import {AggregatedImageCardComponent} from "../aggregated-image-card/aggregated-image-card.component";
import {AggregatedImage} from "../../interfaces/aggregated-image";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
  selector: 'app-aggregated-image-list',
  standalone: true,
  imports: [
    MatPaginator,
    NgForOf,
    AggregatedImageCardComponent,
    NgxPaginationModule
  ],
  templateUrl: './aggregated-image-list.component.html',
  styleUrl: './aggregated-image-list.component.css'
})
export class AggregatedImageListComponent {
  images: AggregatedImage[] = [];
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
