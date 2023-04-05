import { Component } from '@angular/core';
import { AccountService } from '@app/services/account-service/account.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent {
  currentLang: string = 'fr';
  oppositeLang: string = 'en';
  username: string;

  constructor(public translate: TranslateService, private accountService: AccountService) {
    translate.addLangs(['fr', 'en']);
  }

  translateLanguageTo(lang: string) {
    this.oppositeLang = this.currentLang;
    this.currentLang = lang;
    this.translate.use(lang);
    this.updateLanguage(lang);
    //localStorage.setItem("currentLang", lang);
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

  updateLanguage(lang: string) {
    this.accountService.changeLanguage(lang);
  }

}

/*
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
*/
