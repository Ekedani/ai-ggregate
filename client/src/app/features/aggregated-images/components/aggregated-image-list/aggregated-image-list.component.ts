import {Component, DestroyRef, Inject, OnInit} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {AsyncPipe, NgForOf} from "@angular/common";
import {AggregatedImagesService} from "../../aggregated-images.service";
import {LargeAggregatedImageCardComponent} from "../large-aggregated-image-card/large-aggregated-image-card.component";
import {AggregatedImage} from "../../interfaces/aggregated-image";
import {NgxPaginationModule} from "ngx-pagination";
import {SmallAggregatedImageCardComponent} from "../small-aggregated-image-card/small-aggregated-image-card.component";
import {MatDialog} from "@angular/material/dialog";
import {Observable, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-aggregated-image-list',
  standalone: true,
  imports: [
    MatPaginator,
    NgForOf,
    LargeAggregatedImageCardComponent,
    NgxPaginationModule,
    SmallAggregatedImageCardComponent,
    AsyncPipe
  ],
  templateUrl: './aggregated-image-list.component.html',
  styleUrl: './aggregated-image-list.component.css'
})
export class AggregatedImageListComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  @Inject(DestroyRef) destroyRef?: DestroyRef;
  images$: Observable<AggregatedImage[] | any> = this.aggregatedImagesService.aggregatedImages$;
  currentPage: number = 1;
  itemsPerPage: number = 100;
  totalItems: number = 0;

  constructor(
    private aggregatedImagesService: AggregatedImagesService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.loadImages(1, this.itemsPerPage);
    this.aggregatedImagesService.paginationData$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.currentPage = data.page;
        this.totalItems = data.total;
      });
  }

  loadImages(pageIndex = 1, pageSize: number) {
    this.aggregatedImagesService.getAggregatedImages(pageIndex, this.itemsPerPage).subscribe(
      data => {
        this.totalItems = data.total;
      });
  }

  changePage(event: any) {
    this.loadImages(event, this.itemsPerPage);
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
}
