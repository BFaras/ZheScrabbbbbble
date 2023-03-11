import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {

  constructor(public translate: TranslateService) {
    translate.addLangs(['fr', 'en']);
    translate.defaultLang = 'fr';
  }

  ngOnInit(): void {
    this.translate.use('fr');
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
  }

  setActive(event: Event, newLanguage: string) {
    let languageButtons;

    languageButtons = document.getElementsByClassName("lang-button");
    for (let i = 0; i < languageButtons.length; i++) {
      languageButtons[i].className = languageButtons[i].className.replace(" active", "");
    }

    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }

}
