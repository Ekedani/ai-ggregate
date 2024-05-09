import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatListItem, MatListSubheaderCssMatStyler, MatNavList} from "@angular/material/list";

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    RouterLink,
    MatIcon,
    MatListItem,
    MatListSubheaderCssMatStyler,
    MatNavList,
    RouterLinkActive
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

}
