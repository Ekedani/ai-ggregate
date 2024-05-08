import { Component } from '@angular/core';
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {ImageSearchComponent} from "../image-search/image-search.component";

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [
    ImageGalleryComponent,
    ImageSearchComponent
  ],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.css'
})
export class ImageListComponent {

}
