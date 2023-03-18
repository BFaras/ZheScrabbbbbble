import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
  currentLang: string;

  constructor(public translate: TranslateService) {
    translate.addLangs(['fr', 'en']);
    translate.defaultLang = 'fr';
  }

  ngOnInit(): void {
    let current = localStorage.getItem("currentLang");
    if (current) {
      this.translate.use(current);
      this.currentLang = current;
      //this.resetActive();
      //document.getElementById(current)!.className += " active";
    }
    else {
      this.currentLang = 'fr';
      localStorage.setItem("currentLang", 'fr');
      //this.resetActive();
      //document.getElementById('fr')!.className += " active";
    }
  }

  translateLanguageTo(lang: string) {
    this.translate.use(lang);
    localStorage.setItem("currentLang", lang);
    this.currentLang = lang;
  }

  resetActive() {
    let languageButtons = document.getElementsByClassName("lang-button");
    for (let i = 0; i < languageButtons.length; i++) {
      languageButtons[i].className = languageButtons[i].className.replace(" active", "");
    }
  }

  setActive(event: Event) {
    this.resetActive();
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }

}
