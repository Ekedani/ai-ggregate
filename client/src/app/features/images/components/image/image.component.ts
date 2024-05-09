import {Component} from '@angular/core';
import {ImagesService} from "../../images.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css'
})
export class ImageComponent {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log(id);
    });
  }
}
