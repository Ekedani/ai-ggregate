import {Component, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {HeaderComponent} from "./core/components/header/header.component";
import {NavigationComponent} from "./core/components/navigation/navigation.component";
import {ImageGalleryComponent} from "./features/images/components/image-gallery/image-gallery.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {AuthService} from "./core/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    MatSidenavContent,
    MatSidenav,
    MatSidenavContainer,
    RouterOutlet,
    NavigationComponent,
    ImageGalleryComponent,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(
    public authService: AuthService,
  ) {
  }

  @ViewChild(MatSidenav) sidenav: MatSidenav | undefined;

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }
}
