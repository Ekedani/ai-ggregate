import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[appImageFallback]'
})
export class ImageFallbackDirective {
  @Input() appImageFallback: string | undefined;

  constructor(private el: ElementRef<HTMLImageElement>) {
  }

  @HostListener('error')
  loadImageError() {
    this.el.nativeElement.src = this.appImageFallback || 'assets/images/error.jpg';
  }
}
