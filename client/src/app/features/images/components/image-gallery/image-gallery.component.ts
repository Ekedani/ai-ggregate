import {Component} from '@angular/core';
import {AsyncPipe, NgForOf, NgOptimizedImage, SlicePipe} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import {RouterLink} from "@angular/router";
import {ImagesService} from "../../images.service";
import {NgxMasonryModule, NgxMasonryOptions} from "ngx-masonry";


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
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent {
  $galleryImages = this.imagesService.galleryImages$;

  masonryOptions: NgxMasonryOptions = {
    columnWidth: '.grid-item',
    itemSelector: '.grid-item',
    percentPosition: true,
    gutter: 0,
  }

  constructor(private readonly imagesService: ImagesService) {
  }
}
