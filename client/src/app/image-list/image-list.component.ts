import {Component} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-image-list',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.css'
})
export class ImageListComponent {
  items = [];
}
