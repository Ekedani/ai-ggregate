import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForOf, NgOptimizedImage, SlicePipe} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import Masonry from 'masonry-layout';
import imagesloaded from "imagesloaded";
import {RouterLink} from "@angular/router";
import {GalleryImage} from "../../interfaces/gallery-image";
import {ImagesService} from "../../images.service";


@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    NgForOf,
    ImageFallbackDirective,
    NgOptimizedImage,
    SlicePipe,
    RouterLink,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent {
  @ViewChild('masonryContainer') masonryContainer!: ElementRef;

  images!: GalleryImage[]

  constructor(private readonly imagesService: ImagesService) {
  }

  ngOnInit() {
    this.imagesService.galleryImages$.subscribe(images => {
      this.images = images;
    });
  }

  ngAfterViewInit() {
    imagesloaded(this.masonryContainer.nativeElement).on('progress', () => {
      new Masonry(this.masonryContainer.nativeElement, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-item',
        percentPosition: true,
      });
    });
  }
}
