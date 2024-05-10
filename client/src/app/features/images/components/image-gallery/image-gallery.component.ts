import {Component} from '@angular/core';
import {AsyncPipe, NgForOf, NgOptimizedImage, SlicePipe} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import {RouterLink} from "@angular/router";
import {ImagesService} from "../../images.service";
import {NgxMasonryModule, NgxMasonryOptions} from "ngx-masonry";
import {NgxPaginationModule} from "ngx-pagination";
import {Observable} from "rxjs";
import {GalleryImage} from "../../interfaces/gallery-image";
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    NgForOf,
    ImageFallbackDirective,
    NgOptimizedImage,
    SlicePipe,
    RouterLink,
    NgxMasonryModule,
    AsyncPipe,
    NgxPaginationModule,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent {
  $galleryImages: Observable<GalleryImage[] | any> = this.imagesService.galleryImages$;
  page: string | number = 1;
  total: string | number = 0;

  masonryOptions: NgxMasonryOptions = {
    columnWidth: '.grid-item',
    itemSelector: '.grid-item',
    percentPosition: true,
    gutter: 0,
  }

  constructor(
    private readonly imagesService: ImagesService,
    private readonly toastrService: ToastrService,
  ) {
  }

  ngOnInit() {
    this.imagesService.paginationData$
      .subscribe(
        (data) => {
          this.page = data.page;
          this.total = data.total;
        }
      )
  }

  getPage($event: number) {
    this.imagesService.getNewPage($event).subscribe({
        error: (error) => {
          this.toastrService.error(error.message, 'Error')
        }
      }
    )
  }
}
