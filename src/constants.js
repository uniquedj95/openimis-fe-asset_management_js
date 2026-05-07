export const MODULE_NAME = 'assetManagement';

export const ASSET_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY = 'assetManagement.MainMenu.contribution';

export const CONTAINS_LOOKUP = 'Icontains';
export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 20;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const PICKER_QUERY_LIMIT = 50;
export const EMPTY_STRING = '';

// TODO - Revise Rights to match backend AssetsConfig
export const RIGHT_ASSET_SEARCH = 101501;
export const RIGHT_ASSET_VIEW = 101502;
export const RIGHT_ASSET_CREATE = 101503;
export const RIGHT_ASSET_UPDATE = 101504;
export const RIGHT_ASSET_DELETE = 101505;
export const RIGHT_ASSET_ASSIGN = 101506;
export const RIGHT_ASSET_UNASSIGN = 101507;
export const RIGHT_ASSET_HISTORY = 101508;

// Routes (registered under core.Router as pages land)
export const ROUTE_ASSETS = 'assets';
export const ROUTE_ASSET = 'assets/asset';
export const ROUTE_ASSET_HISTORY = 'assets/asset/history';

// Asset status enum
export const ASSET_STATUS = {
  NEW: 'NEW',
  IN_STOCK: 'IN_STOCK',
  ASSIGNED: 'ASSIGNED',
  MAINTENANCE: 'MAINTENANCE',
  RETIRED: 'RETIRED',
  LOST: 'LOST',
};

export const ASSET_STATUS_LIST = [
  ASSET_STATUS.NEW,
  ASSET_STATUS.IN_STOCK,
  ASSET_STATUS.ASSIGNED,
  ASSET_STATUS.MAINTENANCE,
  ASSET_STATUS.RETIRED,
  ASSET_STATUS.LOST,
];

// Allowed transitions per status (terminal states map to []).
export const STATUS_TRANSITIONS = {
  [ASSET_STATUS.NEW]: [ASSET_STATUS.IN_STOCK, ASSET_STATUS.ASSIGNED, ASSET_STATUS.LOST],
  [ASSET_STATUS.IN_STOCK]: [
    ASSET_STATUS.ASSIGNED,
    ASSET_STATUS.MAINTENANCE,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.ASSIGNED]: [
    ASSET_STATUS.IN_STOCK,
    ASSET_STATUS.MAINTENANCE,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.MAINTENANCE]: [
    ASSET_STATUS.IN_STOCK,
    ASSET_STATUS.ASSIGNED,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.RETIRED]: [],
  [ASSET_STATUS.LOST]: [],
};

export const TERMINAL_STATUSES = [ASSET_STATUS.RETIRED, ASSET_STATUS.LOST];

// Assignment history actions
export const ASSIGNMENT_ACTION = {
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  REASSIGN: 'REASSIGN',
};

export const ASSIGNMENT_ACTION_LIST = [
  ASSIGNMENT_ACTION.ASSIGN,
  ASSIGNMENT_ACTION.UNASSIGN,
  ASSIGNMENT_ACTION.REASSIGN,
];

// Device type enum
export const DEVICE_TYPE = {
  PHONE: 'PHONE',
  TABLET: 'TABLET',
};

export const DEVICE_TYPES = [DEVICE_TYPE.PHONE, DEVICE_TYPE.TABLET];

// GraphQL projections — single source of truth for queries and pickers.
// Kept as joined strings so they can be embedded directly in queries
export const ASSET_PROJECTION = [
  'id',
  'uuid',
  'code',
  'name',
  'serialNumber',
  'deviceType',
  'status',
  'imei',
  'manufacturer',
  'model',
  'osVersion',
  'assignedAt',
  'dateCreated',
  'dateUpdated',
  'isDeleted',
  'location { id uuid code name type }',
  'assignedTo { id uuid lastName otherNames }',
];

export const ASSIGNMENT_PROJECTION = [
  'id',
  'uuid',
  'action',
  'notes',
  'dateCreated',
  'asset { id uuid code name }',
  'fromUser { id uuid lastName otherNames }',
  'toUser { id uuid lastName otherNames }',
  'performedBy { id uuid lastName otherNames }',
];
