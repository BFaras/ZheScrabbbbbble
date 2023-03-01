import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
  }

  ngOnInit(): void {
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
  }
}
