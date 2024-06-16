import {Component} from '@angular/core';
import {UsersService} from "../users.service";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    NgForOf,
    AsyncPipe,
    NgIf,
    RouterLink,
    MatIcon
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent {
  users$ = this.usersService.users$;

  constructor(
    private usersService: UsersService,
    private toastrService: ToastrService,
  ) {
  }

  ngOnInit() {
    this.usersService.getUsers().subscribe({
      error: (error) => {
        this.toastrService.error(error.message, 'Помилка пошуку користувачів')
      }
    });
  }
}
