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
    let current = localStorage.getItem("currentLang");
    if (current) {
      this.translate.use(current);
      document.getElementById(current)!.className += " active";
    }
    else {
      localStorage.setItem("currentLang", 'fr');
      document.getElementById('fr')!.className += " active";
    }
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
    var currentLang = lang;
    localStorage.setItem("currentLang", currentLang);
  }

  setActive(event: Event) {
    let languageButtons = document.getElementsByClassName("lang-button");
    for (let i = 0; i < languageButtons.length; i++) {
      languageButtons[i].className = languageButtons[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
    console.log(document.getElementById('fr')!.className);
    console.log(document.getElementById('en')!.className);
  }

}
