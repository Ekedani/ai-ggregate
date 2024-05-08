import {Component, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from "@angular/material/sidenav";
import {HeaderComponent} from "./header/header.component";
import {NavigationComponent} from "./navigation/navigation.component";
import {ImageListComponent} from "./image-list/image-list.component";

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
    ImageListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild(MatSidenav) sidenav: MatSidenav | undefined;

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }
}
