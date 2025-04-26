import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-start-menu',
  standalone:true,
  imports:[CommonModule],
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(private menuService: MenuService, private router: Router) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(items => this.menuItems = items);
  }

    navigate(route: string): void {
    this.router.navigateByUrl(route);
    }
}
