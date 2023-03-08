import { Component, OnInit } from '@angular/core';
import { ThemesService } from '@app/services/themes-service/themes-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  constructor(public translate: TranslateService, private themeService: ThemesService) {
    translate.addLangs(['en', 'fr']);
  }

  ngOnInit(): void {
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
  }

  toggleTheme() {
    if (this.themeService.isInvertedTheme()) {
      this.themeService.setClassicTheme();
    } else {
      this.themeService.setInvertedTheme();
    }
  }
}
