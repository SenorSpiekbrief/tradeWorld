import { SettlementType } from "../../../../shared/enums/SettlementType";
import { Settlement } from "../../../../shared/types/Settlement";

export abstract class CultureService {
    abstract generateSettlementName(rand: () => number): string;
    abstract pickSpecializations(rand: () => number, type: SettlementType): string[];
    abstract addCulturalStructures(settlement: Settlement, rand: () => number): void;
  }