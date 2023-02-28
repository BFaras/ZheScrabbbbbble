import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
    this.translate.use('fr');
  }

  ngOnInit(): void {
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
  }

}
