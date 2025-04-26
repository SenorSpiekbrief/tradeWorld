import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface MenuItem {
  label: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuUrl = 'startmenu.json';

  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.menuUrl);
  }
}
