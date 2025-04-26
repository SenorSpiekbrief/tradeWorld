import { StructureEffect } from "../enums/StructureEffect";

export const structureEffectsMeta: Record<StructureEffect, { description: string, impact: string }> = {
    // Multipliers
    [StructureEffect.ProsperityMultiplier]: {
        description: "Increases the economic prosperity of the settlement.",
        impact: "Boosts trade profits and tax income."
    },
    [StructureEffect.HappinessMultiplier]: {
        description: "Improves the overall happiness of the population.",
        impact: "Higher happiness leads to increased productivity and lower unrest."
    },
    [StructureEffect.ReputationMultiplier]: {
        description: "Enhances the city's reputation in trade and diplomacy.",
        impact: "Better trade deals and diplomatic relations."
    },
    [StructureEffect.PopulationGrowthMultiplier]: {
        description: "Accelerates population growth.",
        impact: "Faster expansion of settlements."
    },
    [StructureEffect.HousingMultiplier]: {
        description: "Increases the efficiency of housing structures.",
        impact: "More people can be accommodated per housing unit."
    },
    [StructureEffect.StorageMultiplier]: {
        description: "Enhances the storage capacity of warehouses and markets.",
        impact: "Allows more goods to be stored before reaching capacity."
    },
    
    // Increases
    [StructureEffect.HousingIncrease]: {
        description: "Directly increases housing availability.",
        impact: "Provides additional space for new residents."
    },
    [StructureEffect.StorageIncrease]: {
        description: "Provides additional storage space.",
        impact: "Allows more goods to be stocked."
    },

    // Production Enhancements
    [StructureEffect.ProductionSpeedMultiplier]: {
        description: "Speeds up production processes in manufacturing buildings.",
        impact: "Faster production of goods and resources."
    },
    [StructureEffect.ResourceExtractionMultiplier]: {
        description: "Increases efficiency of resource-gathering buildings.",
        impact: "Higher output from mines, lumberyards, and farms."
    },

    // Trade & Market Effects
    [StructureEffect.TradeEfficiencyMultiplier]: {
        description: "Improves trade efficiency in markets and harbors.",
        impact: "Better prices for buying and selling goods."
    },
    [StructureEffect.TaxRevenueIncrease]: {
        description: "Boosts tax collection from economic activities.",
        impact: "Higher income from settlements and traders."
    },

    // Defensive Enhancements
    [StructureEffect.DefenseBonus]: {
        description: "Strengthens defensive buildings like towers and walls.",
        impact: "Better resistance against attacks and sieges."
    },
    [StructureEffect.MilitaryTrainingEfficiency]: {
        description: "Improves the efficiency of military academies and barracks.",
        impact: "Faster training and stronger units."
    },
    
    // Additional Effects based on StructureType
    [StructureEffect.WaterAccess]: {
        description: "Provides fresh water to surrounding buildings.",
        impact: "Improves sanitation and boosts population growth."
    },
    [StructureEffect.WoodProductionBoost]: {
        description: "Enhances wood production from forestry buildings.",
        impact: "Higher wood output from lumberyards and woodcutters."
    },
    [StructureEffect.FoodProductionBoost]: {
        description: "Boosts food production in farms and mills.",
        impact: "Increases food supply for growing populations."
    },
    [StructureEffect.StorageSecurity]: {
        description: "Improves security of stored goods.",
        impact: "Reduces theft and spoilage in warehouses and banks."
    },
    [StructureEffect.NavigationAid]: {
        description: "Assists in navigation for sea trade and exploration.",
        impact: "Increases efficiency of docks, harbors, and lighthouses."
    },
    [StructureEffect.CulturalInfluence]: {
        description: "Expands the cultural and religious influence of the city.",
        impact: "Enhances reputation and attracts more settlers."
    },
    [StructureEffect.ResourceProcessingEfficiency]: {
        description: "Improves processing efficiency in workshops and forges.",
        impact: "Higher output of refined goods like metal, cloth, and tools."
    }
};
