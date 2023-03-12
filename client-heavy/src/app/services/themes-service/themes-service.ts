import { Injectable } from '@angular/core';
import { classic, inverted, Theme } from '@app/constants/themes';


@Injectable({
  providedIn: 'root'
})
export class ThemesService {
  private activeTheme: Theme = classic;
  private availableThemes: Theme[] = [classic, inverted];

  getAvailableThemes(): Theme[] {
    return this.availableThemes;
  }

  getActiveTheme(): Theme {
    return this.activeTheme;
  }

  isInvertedTheme(): boolean {
    return this.activeTheme.name === inverted.name;
  }

  setInvertedTheme(): void {
    this.setActiveTheme(inverted);
  }

  setClassicTheme(): void {
    this.setActiveTheme(classic);
  }

  setActiveTheme(theme: Theme): void {
    this.activeTheme = theme;

    Object.keys(this.activeTheme.properties).forEach(property => {
      document.documentElement.style.setProperty(
        property,
        this.activeTheme.properties[property]
      );
    });
  }

  rememberTheme() {
    let current = localStorage.getItem("currentTheme");
    if (current) {
      this.getAvailableThemes().forEach((theme: Theme) => {
        if (theme.name.toString() === current) this.setActiveTheme(theme);
      });
      localStorage.setItem("currentTheme", current);
    }
    else {
      localStorage.setItem("currentTheme", classic.toString());
    }
  }
}
