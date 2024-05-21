import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {combineLatest, map, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UsersService} from '../users.service';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {AuthService} from "../../../core/services/auth.service";
import {ImagesService} from "../../images/images.service";
import {NgxPaginationModule} from "ngx-pagination";
import {GalleryImage} from "../../images/interfaces/gallery-image";
import {MatButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {UploadImageComponent} from "../../../shared/components/upload-image/upload-image.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatIcon, NgxPaginationModule, NgForOf, RouterLink, MatButton],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user$?: Observable<any>;
  isPersonalProfile$?: Observable<boolean>;
  images$?: Observable<GalleryImage[]>;
  imagesPage: number = 1;
  imagesTotal: number = 0;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private authService: AuthService,
    private imagesService: ImagesService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.user$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.usersService.getUser(id);
      })
    );

    this.isPersonalProfile$ = combineLatest([
      this.route.paramMap,
      this.authService.getUserInfo()
    ]).pipe(
      map(([params, userInfo]) => params.get('id') === userInfo?.id)
    );

    this.loadImages();
  }

  loadImages() {
    this.images$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = params.get('id');
        return this.imagesService.getImagesByAuthor(userId, this.imagesPage).pipe(
          map(response => {
            this.imagesTotal = response.total;
            this.imagesPage = response.page;
            return response.images;
          })
        );
      })
    );
  }

  pageChange($event: number) {
    this.imagesPage = $event;
    this.loadImages();
  }

  onUploadImage() {
    this.dialog.open(UploadImageComponent, {
      width: '720px'
    });
  }
}

