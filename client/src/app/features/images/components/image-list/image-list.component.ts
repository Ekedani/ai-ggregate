import { Component } from '@angular/core';
import {ImageGalleryComponent} from "../image-gallery/image-gallery.component";
import {ImageSearchComponent} from "../image-search/image-search.component";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [
    ImageGalleryComponent,
    ImageSearchComponent,
    NgxPaginationModule
  ],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.css'
})
export class ImageListComponent {

}
