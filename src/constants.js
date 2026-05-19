export const MODULE_NAME = 'assetManagement';

export const ASSET_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY = 'assetManagement.MainMenu.contribution';

export const CONTAINS_LOOKUP = 'Icontains';
export const DEFAULT_DEBOUNCE_TIME = 500;
export const DEFAULT_PAGE_SIZE = 20;
export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const PICKER_QUERY_LIMIT = 50;
export const EMPTY_STRING = '';

// Rights — aligned with backend AssetsConfig (160001–160008).
export const RIGHT_ASSET_SEARCH = 160001;
export const RIGHT_ASSET_CREATE = 160002;
export const RIGHT_ASSET_UPDATE = 160003;
export const RIGHT_ASSET_DELETE = 160004;
export const RIGHT_ASSET_ASSIGN = 160005;
export const RIGHT_ASSET_UNASSIGN = 160006;
export const RIGHT_ASSET_MAINTENANCE = 160007;
export const RIGHT_ASSET_RETIRE = 160008;

// Routes (registered under core.Router as pages land)
export const ROUTE_ASSETS = 'assets';
export const ROUTE_ASSET = 'assets/asset';
export const ROUTE_ASSET_HISTORY = 'assets/asset/history';

// Asset status enum — codes match the backend `AssetStatus.code` seeds.
export const ASSET_STATUS = {
  AVAILABLE: 'available',
  ASSIGNED: 'assigned',
  REPAIR: 'repair',
  RETIRED: 'retired',
  LOST: 'lost',
};

export const ASSET_STATUS_LIST = [
  ASSET_STATUS.AVAILABLE,
  ASSET_STATUS.ASSIGNED,
  ASSET_STATUS.REPAIR,
  ASSET_STATUS.RETIRED,
  ASSET_STATUS.LOST,
];

// Allowed transitions per status (terminal states map to []).
export const STATUS_TRANSITIONS = {
  [ASSET_STATUS.AVAILABLE]: [
    ASSET_STATUS.ASSIGNED,
    ASSET_STATUS.REPAIR,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.ASSIGNED]: [
    ASSET_STATUS.AVAILABLE,
    ASSET_STATUS.REPAIR,
    ASSET_STATUS.RETIRED,
    ASSET_STATUS.LOST,
  ],
  [ASSET_STATUS.REPAIR]: [
    ASSET_STATUS.AVAILABLE,
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

// Device type enum — codes match the backend `DeviceType.code` seeds.
export const DEVICE_TYPE = {
  PHONE: 'phone',
  TABLET: 'tablet',
};

export const DEVICE_TYPES = [DEVICE_TYPE.PHONE, DEVICE_TYPE.TABLET];

// GraphQL projections — single source of truth for queries and pickers.
// Mirrors the AssetGQLType exposed by openimis-be-asset.
export const ASSET_PROJECTION = [
  'id',
  'uuid',
  'name',
  'serialNumber',
  'imei',
  'manufacturer',
  'model',
  'osVersion',
  'dateCreated',
  'dateUpdated',
  'isDeleted',
  'deviceType { id code name }',
  'status { id code name canAssign }',
  'location { id uuid code name type }',
  'assignedTo { id username lastName otherNames }',
];

export const ASSIGNMENT_PROJECTION = [
  'id',
  'uuid',
  'notes',
  'assignedDate',
  'returnedDate',
  'isActive',
  'dateCreated',
  'asset { id uuid name serialNumber }',
  'assignedTo { id username lastName otherNames }',
  'assignedBy { id username lastName otherNames }',
];
