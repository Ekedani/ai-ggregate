import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, map, Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UsersService} from '../users.service';
import {AsyncPipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatIcon],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user$?: Observable<any>;
  isPersonalProfile$?: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private authService: AuthService
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
  }
}
