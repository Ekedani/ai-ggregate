import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {AsyncPipe, NgForOf} from "@angular/common";
import {AggregatedImagesService} from "../../aggregated-images.service";
import {LargeAggregatedImageCardComponent} from "../large-aggregated-image-card/large-aggregated-image-card.component";
import {AggregatedImage} from "../../interfaces/aggregated-image";
import {NgxPaginationModule} from "ngx-pagination";
import {SmallAggregatedImageCardComponent} from "../small-aggregated-image-card/small-aggregated-image-card.component";
import {MatDialog} from "@angular/material/dialog";
import {Observable, Subject, takeUntil} from "rxjs";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-aggregated-image-list',
  standalone: true,
  imports: [
    MatPaginator,
    NgForOf,
    LargeAggregatedImageCardComponent,
    NgxPaginationModule,
    SmallAggregatedImageCardComponent,
    AsyncPipe,
    MatCheckbox,
    MatButton
  ],
  templateUrl: './aggregated-image-list.component.html',
  styleUrl: './aggregated-image-list.component.css'
})
export class AggregatedImageListComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  currentPage: number = 1;
  itemsPerPage: number = 100;
  totalItems: number = 0;
  images$: Observable<AggregatedImage[] | any> = this.aggregatedImagesService.aggregatedImages$;
  selectedImages = new Set<AggregatedImage>();

  constructor(
    private aggregatedImagesService: AggregatedImagesService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.loadImages(1);
    this.aggregatedImagesService.paginationData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.currentPage = data.page;
        this.totalItems = data.total;
        this.selectedImages.clear();
      });
  }

  loadImages(pageIndex = 1) {
    this.aggregatedImagesService.getAggregatedImages(pageIndex, this.itemsPerPage).subscribe(
      data => {
        this.totalItems = data.total;
      });
  }

  openLargeCard(image: AggregatedImage) {
    this.dialog.open(LargeAggregatedImageCardComponent, {
      data: {image}
    })
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  isSelected(image: AggregatedImage): boolean {
    return this.selectedImages.has(image);
  }

  toggleSelection(image: AggregatedImage): void {
    if (this.isSelected(image)) {
      this.selectedImages.delete(image);
    } else {
      this.selectedImages.add(image);
    }
  }

}
