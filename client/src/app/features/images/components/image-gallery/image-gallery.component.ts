import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForOf, NgOptimizedImage} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import Masonry from 'masonry-layout';
import imagesloaded from "imagesloaded";


@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [
    NgForOf,
    ImageFallbackDirective,
    NgOptimizedImage,
  ],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css'
})
export class ImageGalleryComponent {
  @ViewChild('masonryContainer') masonryContainer!: ElementRef;

  images = [
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/200/700', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/800/200', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/200/700', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/800/200', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/200/700', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/800/200', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/200/700', alt: 'Image 4'},
    {src: 'https://picsum.photos/400/300', alt: 'Image 1'},
    {src: 'https://picsum.photos/200/300', alt: 'Image 2'},
    {src: 'https://picsum.photos/600/300', alt: 'Image 3'},
    {src: 'https://picsum.photos/800/200', alt: 'Image 4'},
  ];

  ngAfterViewInit() {
    imagesloaded(this.masonryContainer.nativeElement).on('progress', () => {
      new Masonry(this.masonryContainer.nativeElement, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-item',
        percentPosition: true,
        horizontalOrder: true,
      });
    });
  }
}
