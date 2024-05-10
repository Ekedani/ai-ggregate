import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {UsersService} from '../users.service';
import {AsyncPipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatIcon],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user$?: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService
  ) {
  }

  ngOnInit() {
    this.user$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.usersService.getUser(id);
      })
    );
  }
}
