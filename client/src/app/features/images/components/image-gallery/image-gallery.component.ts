import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgForOf, NgOptimizedImage, SlicePipe} from "@angular/common";
import {ImageFallbackDirective} from "../../../../shared/directives/image-fallback.directive";
import Masonry from 'masonry-layout';
import imagesloaded from "imagesloaded";
import {RouterLink} from "@angular/router";


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

  images = [
    {
      id: 1,
      src: 'https://picsum.photos/400/300',
      prompt: 'fabric print design Peony pattern, Chinese legendary flower, willow tree , combined with ancient Chinese paintings which is an advertising billboard Antique Chinese items, vintage, light colored background.',
      author: {username: 'user123'}
    },
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user456'}},
    {
      id: 1,
      src: 'https://picsum.photos/600/300',
      prompt: 'Vogue Runway Model with long Pigtails in the style of candycore hair, pale skin and light pink lips --v 6. 0 --ar 4:5',
      author: {username: 'barbossa'}
    },
    {src: 'https://picsum.photos/200/700', prompt: 'Image 4', author: {username: 'user101'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user102'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user103'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user104'}},
    {src: 'https://picsum.photos/800/200', prompt: 'Image 4', author: {username: 'user105'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user106'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user107'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user108'}},
    {src: 'https://picsum.photos/200/700', prompt: 'Image 4', author: {username: 'user109'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user110'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user111'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user112'}},
    {src: 'https://picsum.photos/800/200', prompt: 'Image 4', author: {username: 'user113'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user114'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user115'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user116'}},
    {src: 'https://picsum.photos/200/700', prompt: 'Image 4', author: {username: 'user117'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user118'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user119'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user120'}},
    {src: 'https://picsum.photos/800/200', prompt: 'Image 4', author: {username: 'user121'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user122'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user123'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user124'}},
    {src: 'https://picsum.photos/200/700', prompt: 'Image 4', author: {username: 'user125'}},
    {src: 'https://picsum.photos/400/300', prompt: 'Image 1', author: {username: 'user126'}},
    {src: 'https://picsum.photos/200/300', prompt: 'Image 2', author: {username: 'user127'}},
    {src: 'https://picsum.photos/600/300', prompt: 'Image 3', author: {username: 'user128'}},
    {src: 'https://picsum.photos/800/200', prompt: 'Image 4', author: {username: 'user129'}},
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

  protected readonly prompt = prompt;
}
