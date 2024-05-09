import {Component, EventEmitter, Output} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatAnchor, MatButton, MatIconButton} from "@angular/material/button";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Observable} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatButton,
    MatAnchor,
    RouterLink,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleDrawer = new EventEmitter<unknown>();
  userInfo$: Observable<{ username?: string; id?: string; roles?: string[] } | null>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
  ) {
    this.userInfo$ = this.authService.getUserInfo();
  }

  onToggleClick(): void {
    this.toggleDrawer.emit();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.toastrService.error(error.message, 'Logout failed');
      }
    });
  }
}
