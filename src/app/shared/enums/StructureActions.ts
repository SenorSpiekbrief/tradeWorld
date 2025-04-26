export enum StructureAction {
    // 🏗️ **Infrastructure & Building Management**
    UpgradeBuilding = "upgrade_building", // Improve efficiency, capacity
    DemolishBuilding = "demolish_building", // Remove unwanted structures
    MaintainBuilding = "maintain_building", // Routine upkeep
    ExpandBuilding = "expand_building", // Increase size or production output
    AllocateLand = "allocate_land", // Assign land to structures, settlements
    ConstructBuilding = "construct_building", // Build new structures
  
    // 💰 **Trade & Commerce**
    Trade = "trade", // Buy/sell goods at markets, harbors, etc.
    SetPrices = "set_prices", // Adjust prices of stored/traded goods
    StoreGoods = "store_goods", // Move items into storage structures
    SellGoods = "sell_goods", // Offload excess stock for profit
    BuyGoods = "buy_goods", // Acquire materials for production or resale
    ManageCaravan = "manage_caravan", // Organize long-distance trade routes
    NegotiateDeal = "negotiate_deal", // Haggle for better prices or partnerships
    CollectTolls = "collect_tolls", // Charge travelers in certain locations
    LeaseProperty = "lease_property", // Rent out structures or land for passive income

    // ⚒️ **Finance & Banking**
    ManageLoans = "manage_loans",
    ManageBonds = "manage_bonds",
    ManageAccounts = "manage_accounts",

  
    // ⚒️ **Production & Crafting**
    StartProduction = "start_production", // Begin manufacturing goods
    RefineMaterials = "refine_materials", // Process raw resources
    ForgeWeapons = "forge_weapons", // Craft specialized equipment (RPG element)
    BrewAlcohol = "brew_alcohol", // Mead, beer, wine production
    CraftLuxuryGoods = "craft_luxury_goods", // Jewelry, perfumes, fine clothing
    PreserveFood = "preserve_food", // Salt, smoke, or cure food for storage
    PrintBooks = "print_books", // Create maps, compendiums, scrolls for trade
    CommissionArt = "commission_art", // Paintings, sculptures, decorative goods
    BreedLivestock = "breed_livestock", // Increase herd sizes for farms
  
    // 🏛️ **Governance & Estate Management**
    HostEvent = "host_event", // Festivals, feasts, gambling nights (taverns, palaces)
    HoldCouncil = "hold_council", // Discuss settlement matters
    CollectTaxes = "collect_taxes", // Passive income from settlements
    EnforceLaws = "enforce_laws", // Maintain order within a controlled region
    RecruitWorkers = "recruit_workers", // Hire NPCs for production, trade
    ManageGuild = "manage_guild", // Control merchant/trade guilds for benefits
    GrantCharter = "grant_charter", // Allow settlements/players to open businesses
    IssueDecree = "issue_decree", // Modify trade rules in controlled regions
  
    // 🛡️ **Defense & Security**
    TrainGuards = "train_guards", // Defend marketplaces, banks, and trade routes
    FortifyBuilding = "fortify_building", // Strengthen structures against raids
    HireMercenaries = "hire_mercenaries", // Temporary combat units
    BribeOfficials = "bribe_officials", // Influence settlements or market trends
    ManagePrivateers = "manage_privateers", // Oversee hired pirate ships for trade disruption
  
    // 🔥 **Special & Unique Actions**
    WriteMaps = "write_maps", // Create trade routes, dungeon maps, exploration guides
    IssueContracts = "issue_contracts", // Task NPCs or players with quests/jobs
    Gamble = "gamble", // Risk money in taverns, private halls
    SmuggleGoods = "smuggle_goods", // Secretly transport contraband for profit
    OrganizeExpedition = "organize_expedition", // Fund journeys for trade or discovery
    EstablishOutpost = "establish_outpost",
    SellProperty = "SellProperty", // Expand trade presence into new regions
  }
  