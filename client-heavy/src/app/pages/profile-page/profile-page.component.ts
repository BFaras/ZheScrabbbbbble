import { Component, OnInit } from '@angular/core';
import { ThemesService } from '@app/services/themes-service/themes-service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  constructor(private themeService: ThemesService) {}

  ngOnInit(): void {
  }

  toggleTheme() {
    if (this.themeService.isInvertedTheme()) {
      this.themeService.setClassicTheme();
    } else {
      this.themeService.setInvertedTheme();
    }
  }
}
