import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { classic, Theme } from '@app/constants/themes';
import { ThemesService } from '@app/services/themes-service/themes-service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  constructor(private themeService: ThemesService, private router: Router) {}

  ngOnInit(): void {
    let current = localStorage.getItem("currentTheme");
    if (current) {
      this.changeThemeTo(current);
      document.getElementById(current)!.className += " active";
    }
    else {
      localStorage.setItem("currentTheme", classic.toString());
      document.getElementById('classic')!.className += " active";
    }
  } //ne fonctionne que sur profile page

  changeThemeTo(newTheme: string) {
    this.themeService.getAvailableThemes().forEach((theme: Theme) => {
      if (theme.name.toString() === newTheme) this.themeService.setActiveTheme(theme);
    });
    localStorage.setItem("currentTheme", newTheme);
  }

  setActive(event: Event) {
    let themes = document.getElementsByClassName("theme-button");
    for (let i = 0; i < themes.length; i++) {
      themes[i].className = themes[i].className.replace(" active", "");
    }
    (event.currentTarget! as HTMLTextAreaElement).className += " active";
  }

  goToFriends() {
    this.router.navigate(['/friends-page']);
  }
}
