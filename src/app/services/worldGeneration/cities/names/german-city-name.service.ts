import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CityNameService {
  // Roots by biome category
  private coastalRoots = [
    'Haven', 'Port', 'Fischer', 'Wasser', 'Strand', 'Seeburg', 'Flut', 'Küste',
    'Woge', 'Möwe', 'Anker', 'Fluss', 'Bucht', 'Brise', 'Klippe', 'Ufer', 'Segel',
    'Reede', 'Kai', 'Boot', 'Sturm', 'Muschel', 'Sand', 'Düne', 'Seegang', 'Untiefe'
  ];
  
  private forestRoots = [
    'Wald', 'Tann', 'Holz', 'Eiche', 'Grün', 'Forst', 'Lichtung', 'Moos', 'Birke',
    'Farn', 'Fuchs', 'Hirsch', 'Eber', 'Wipfel', 'Ast', 'Wurzel', 'Schlucht',
    'Wacht', 'Dachs', 'Adler', 'Wiesel', 'Schatten', 'Nebel', 'Blatt', 'Stamm'
  ];
  
  private grasslandRoots = [
    'Wiese', 'Feld', 'Aue', 'Weide', 'Flur', 'Gras', 'Halm', 'Saat', 'Ähre',
    'Blume', 'Sichel', 'Hof', 'Herde', 'Moor', 'Bach', 'Quelle', 'Rain', 'Hang',
    'Breite', 'Niederung', 'Ried', 'Lohe', 'Winkel', 'Bühel', 'Dorf'
  ];
  
  private mountainRoots = [
    'Stein', 'Berg', 'Kliff', 'Hoch', 'Tal', 'Hang', 'Kamm', 'Fels', 'Gipfel',
    'Spitze', 'Abgrund', 'Höhe', 'Grotte', 'Zinne', 'Eis', 'Schnee', 'Frost',
    'Sturm', 'Donner', 'Wacht', 'Gipfelgrat', 'Schlucht', 'Kessel', 'Pass', 'Stiege'
  ];
  
  private generalSuffixes = [
    'burg', 'furt', 'hafen', 'stedt', 'beck', 'berg', 'mark', 'heim', 'brück', 'stein', 'dorf',
    'thal', 'mund', 'torf', 'wacht', 'werder', 'brock', 'wang', 'grund', 'ried', 'linde',
    'hügel', 'kamm', 'moor', 'rain', 'horst', 'bach', 'feld', 'hain', 'hainau', 'wiese', 'aue'
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
