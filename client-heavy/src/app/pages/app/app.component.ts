import { Component, OnInit } from '@angular/core';
import { classic } from '@app/constants/themes';
import { ThemesService } from '@app/services/themes-service/themes-service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(private themes: ThemesService) {}

    ngOnInit(): void {
        this.themes.setActiveTheme(classic);
    }
}
