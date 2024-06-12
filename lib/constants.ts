export enum SIDE {
  BUY = "buy",
  SELL = "sell",
}

export enum ORDER_TYPE {
  LIMIT = "limit",
  MARKET = "market",
  STOP_LIMIT = "stopLimit",
  STOP_MARKET = "stopMarket",
  TAKE_PROFIT_LIMIT = "takeProfitLimit",
  TAKE_PROFIT_MARKET = "takeProfitMarket",
}

export enum TIME_IN_FORCE {
  GTC = "GTC", // Good Till Cancel
  IOC = "IOC", // Immediate or Cancel
  FOK = "FOK", // Fill or Kill
  DAY = "Day", // valid during Day
  GTD = "GTD", // Good Till Date
}

export enum SORT {
  ASC = "ASC",
  DESC = "DESC",
}

export enum SORT_BY {
  TIMESTAMP = "timestamp",
  ID = "id",
}


export enum ORDER_BY {
  CREATED_AT = "created_at",
  UPDATED_AT = "updated_at",
  LAST_ACTIVITY_AT = "last_activity_at",
  ID = "id",
}

export enum PERIOD {
  _1_MINUTE = "M1",
  _3_MINUTES = "M3",
  _5_MINUTES = "M5",
  _15_MINUTES = "M15",
  _30_MINUTES = "M30",
  _1_HOUR = "H1",
  _4_HOURS = "H4",
  _1_DAY = "D1",
  _7_DAYS = "D7",
  _1_MONTH = "1M",
}

export enum IDENTIFY_BY {
  EMAIL = "email",
  USERNAME = "username",
}

export enum ACCOUNT {
  WALLET = "wallet",
  SPOT = "spot",
}

export enum USE_OFFCHAIN {
  NEVER = "never",
  OPTIONALY = "optionaly",
  REQUIRED = "required",
}

export enum TRANSACTION_TYPE {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
  SWAP = "SWAP",
}

export enum TRANSACTION_SUBTYPE {
  UNCLASSIFIED = "UNCLASSIFIED",
  BLOCKCHAIN = "BLOCKCHAIN",
  AFFILIATE = "AFFILIATE",
  OFFCHAIN = "OFFCHAIN",
  FIAT = "FIAT",
  SUBACCOUNT = "SUB_ACCOUNT",
  WALLETTOSPOT = "WALLET_TO_SPOT",
  SPOTTOWALLET = "SPOT_TO_WALLET",
  CHAIN_SWITCH_FROM = "CHAIN_SWITCH_FROM",
  CHAIN_SWITCH_TO = "CHAIN_SWITCH_TO",
}

export enum TRANSACTION_STATUS {
  CREATED = "CREATED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS",
  ROLLEDBACK = "ROLLED_BACK",
}

export enum TICKER_SPEED {
  _1_S = "1s",
  _3_S = "3s",
}

export enum PRICE_RATE_SPEED {
  _1_S = "1s",
  _3_S = "3s",
}

export enum ORDER_BOOK_SPEED {
  _100_MS = "100ms",
  _500_MS = "500ms",
  _1000_MS = "1000ms",
}

export enum DEPTH {
  _5 = "D5",
  _10 = "D10",
  _20 = "D20",
}

export enum NOTIFICATION {
  SNAPSHOT = "snapshot",
  UPDATE = "update",
  DATA = "data",
}

export enum CONTINGENCY {
  AON = "allOrNone",
  OCO = "oneCancelOther",
  OTO = "oneTriggerOther",
  OTOCO = "oneTriggerOneCancelOther",
  ALL_OR_NONE = AON,
  ONE_CANCEL_OTHER = OCO,
  ONE_TRIGGER_OTHER = OTO,
  ONE_TRIGGER_ONE_CANCEL_OTHER = OTOCO,
}

export enum ORDER_STATUS {
  NEW = "new",
  SUSPENDED = "suspended",
  PARTIALLY_FILLED = "partiallyFilled",
  FILLED = "filled",
  CANCELED = "canceled",
  EXPIRED = "expired",
}
export const REPORT_STATUS = ORDER_STATUS;

export enum REPORT_TYPE {
  STATUS = "status",
  NEW = "new",
  CANCELED = "canceled",
  REJECTED = "rejected",
  EXPIRED = "expired",
  SUSPENDED = "suspended",
  TRADE = "trade",
  REPLACED = "replaced",
}


export enum SYMBOL_STATUS {
  WORKING = "working",
  SUSPENDED = "suspended",
}

export enum TRANSFER_TYPE {
  TO_SUB_ACCOUNT = "to_sub_account",
  FROM_SUB_ACCOUNT = "from_sub_account",
}

export enum SUB_ACCOUNT_STATUS {
  NEW = "new",
  ACTIVE = "active",
  DISABLE = "disable",
}

export enum NOTIFICATION_TYPE {
  SNAPSHOT = "snapshot",
  UPDATE = "update",
  DATA = "data",
  COMMAND = "COMMAND",
}

export enum SUBSCRIPTION_MODE {
  UPDATES = "updates",
  BATCHES = "batches",
}
