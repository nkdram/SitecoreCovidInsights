import { Component } from '@angular/core';
import { SciLogoutService } from '@speak/ng-sc/logout';
import { ActivatedRoute } from '@angular/router';
import {SciAuthService} from '@speak/ng-sc/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isNavigationShown: boolean = true;

  constructor(
    public authService: SciAuthService,
    public logoutService: SciLogoutService,
    private route: ActivatedRoute
  ) { }

  title = 'Covid Traffic app';
}
