import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

interface InventoryItem {
  name: string;
  icon: string;
  quantity: number;
}

interface EquipmentSlot {
  slot: string;
  item: InventoryItem | null;
}

interface Asset {
  name: string;
  value: number;
  category: string;
}

interface Relation {
  name: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-inventory',
  standalone:true,
  imports:[CommonModule, MatTabsModule],
  templateUrl: './inventory.dialog.html',
  styleUrls: ['./inventory.dialog.scss']
})
export class InventoryDialog {
  tabs = ['Inventory', 'Equipment', 'Assets', 'Relations'];
  selectedTab = 'Inventory';

  inventory: InventoryItem[] = [
    { name: 'Health Potion', icon: '🧪', quantity: 5 },
    { name: 'Iron Sword', icon: '⚔️', quantity: 1 },
    { name: 'Gold Coin', icon: '💰', quantity: 100 }
  ];

  equipmentSlots: EquipmentSlot[] = [
    { slot: 'Head', item: null },
    { slot: 'Chest', item: { name: 'Iron Armor', icon: '🛡️', quantity: 1 } },
    { slot: 'Weapon', item: { name: 'Iron Sword', icon: '⚔️', quantity: 1 } }
  ];

  assets: Asset[] = [
    { name: 'Trading Post', value: 5000, category: 'Real Estate' },
    { name: 'Caravan', value: 1200, category: 'Transport' }
  ];

  relations: Relation[] = [
    { name: 'John the Merchant', role: 'Accountant', status: 'Trusted' },
    { name: 'Erik the Guard', role: 'Guard', status: 'Loyal' }
  ];

  constructor(public dialogRef: MatDialogRef<InventoryDialog>) {}

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  close(): void {
    this.dialogRef.close();
  }
}
