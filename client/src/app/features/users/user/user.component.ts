import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, map, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UsersService} from '../users.service';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {AuthService} from "../../../core/services/auth.service";
import {AiGeneratedImage} from "../../images/interfaces/ai-generated-image";
import {ImagesService} from "../../images/images.service";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatIcon, NgxPaginationModule, NgForOf],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user$?: Observable<any>;
  isPersonalProfile$?: Observable<boolean>;
  images$?: Observable<AiGeneratedImage[]>;
  page: number = 1;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private authService: AuthService,
    private imagesService: ImagesService,
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

    this.images$ = this.route.paramMap.pipe(
      switchMap(params => {
        const userId = params.get('id');
        return this.imagesService.getUserImages(userId, this.page);
      })
    );
  }
}

