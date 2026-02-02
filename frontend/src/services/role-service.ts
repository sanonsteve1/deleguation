import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../models/role';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private url = '/ws/role';

    constructor(private http: HttpClient) {}

    /**
     * Lister tous les roles.
     */
    lister(): Observable<Role[]> {
        return this.http.get<Role[]>(this.url + '/lister');
    }

    /**
     * Enregistrer un role.
     */
    enregistrer(role: Role): Observable<Role> {
        return this.http.post<Role>(this.url + '/enregistrer', role);
    }

    /**
     * Modifier un role.
     */
    modifier(role: Role): Observable<Role> {
        return this.http.put<Role>(this.url + `/modifier/${role.id}`, Role);
    }
}
