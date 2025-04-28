import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CityNameService {
    
  private coastalRoots = [
    'Haven', 'Kade', 'Anker', 'Water', 'Strand', 'Zeeburg', 'Golf', 'Kust',
    'Meeuw', 'Rots', 'Baai', 'Bries', 'Klip', 'Oever', 'Zeil', 'Vloed',
    'Rivier', 'Inham', 'Boot', 'Storm', 'Mossel', 'Zand', 'Duin', 'Getij', 'Vissers'
  ];
  
  private forestRoots = [
    'Woud', 'Bos', 'Hout', 'Eik', 'Groen', 'Bosrand', 'Open plek', 'Mos', 'Berk',
    'Varens', 'Vos', 'Hert', 'Everzwijn', 'Twijg', 'Wortel', 'Slenk',
    'Burcht', 'Das', 'Adelaar', 'Wezel', 'Schaduw', 'Nevel', 'Blad', 'Stam'
  ];
  
  private grasslandRoots = [
    'Weide', 'Veld', 'Aa', 'Graas', 'Vlak', 'Gras', 'Halm', 'Zaad', 'Aar',
    'Bloem', 'Sikkel', 'Hoeve', 'Kudde', 'Moeras', 'Beek', 'Bron', 'Zoom',
    'Breedte', 'Laagland', 'Riet', 'Lo', 'Hoek', 'Hof', 'Dorp'
  ];
  
  private mountainRoots = [
    'Steen', 'Berg', 'Klip', 'Hoogte', 'Dal', 'Helling', 'Kam', 'Rots', 'Top',
    'Piek', 'Afgrond', 'Hoog', 'Grot', 'Punt', 'IJs', 'Sneeuw', 'Vorst',
    'Storm', 'Donder', 'Wacht', 'Kloof', 'Kom', 'Pas', 'Trap'
  ];
  
  private generalSuffixes = [
    'burg', 'voorde', 'haven', 'stede', 'beek', 'berg', 'markt', 'heem', 'brug', 'steen', 'dorp',
    'dal', 'mond', 'veen', 'wacht', 'waard', 'broek', 'wang', 'grond', 'riet', 'linde',
    'heuvel', 'kam', 'moer', 'zoom', 'horst', 'beek', 'veld', 'bos', 'wijk', 'veen'
  ];
  
  
  constructor() {}

  generate(seedRandom: () => number, biomeHint: string): string {
    let roots: string[] = [];

    if (biomeHint.includes('ocean') || biomeHint.includes('water') || biomeHint.includes('beach')) {
      roots = this.coastalRoots;
    } else if (biomeHint.includes('forest') || biomeHint.includes('woodland') || biomeHint.includes('taiga')) {
      roots = this.forestRoots;
    } else if (biomeHint.includes('grassland') || biomeHint.includes('plains')) {
      roots = this.grasslandRoots;
    } else if (biomeHint.includes('mountain') || biomeHint.includes('rock') || biomeHint.includes('alpine')) {
      roots = this.mountainRoots;
    } else {
      roots = [...this.forestRoots, ...this.grasslandRoots];
    }

    const root = roots[Math.floor(seedRandom() * roots.length)];
    const suffix = this.generalSuffixes[Math.floor(seedRandom() * this.generalSuffixes.length)];

    return `${root}${suffix}`;
  }
}
