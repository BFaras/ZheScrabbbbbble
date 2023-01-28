import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Dictionary } from '@app/classes/dictionary';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getDictionary(title: string): Observable<Dictionary> {
        return this.http
            .get<Dictionary>(`${this.baseUrl}api/dictionary/${title.replace(' ', '%20')}`)
            .pipe(catchError((error: Error) => this.handleError<Dictionary>(error)));
    }

    postDictionary(dictionary: Dictionary): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}api/dictionary`, dictionary)
            .pipe(catchError((err) => this.handleError<void>(err, "Impossible d'ajouter le dictionaire. Un dictionaire avec ce nom existe déjà")));
    }

    private handleError<T>(error: Error, message?: string, result?: T): Observable<T> {
        if (message) confirm(message);
        return of(result as T);
    }
}
