const { settings } = require(`../config`)
const { getNeutralEmote } = require(`../utils`)

const validTimeZones = {
    'africa/abidjan': 'Africa/Abidjan',
    'africa/algiers': 'Africa/Algiers',
    'africa/bissau': 'Africa/Bissau',
    'africa/cairo': 'Africa/Cairo',
    'africa/casablanca': 'Africa/Casablanca',
    'africa/ceuta': 'Africa/Ceuta',
    'africa/el_aaiun': 'Africa/El_Aaiun',
    'africa/johannesburg': 'Africa/Johannesburg',
    'africa/juba': 'Africa/Juba',
    'africa/khartoum': 'Africa/Khartoum',
    'africa/lagos': 'Africa/Lagos',
    'africa/maputo': 'Africa/Maputo',
    'africa/monrovia': 'Africa/Monrovia',
    'africa/nairobi': 'Africa/Nairobi',
    'africa/ndjamena': 'Africa/Ndjamena',
    'africa/sao_tome': 'Africa/Sao_Tome',
    'africa/tripoli': 'Africa/Tripoli',
    'africa/tunis': 'Africa/Tunis',
    'africa/windhoek': 'Africa/Windhoek',
    'america/adak': 'America/Adak',
    'america/anchorage': 'America/Anchorage',
    'america/araguaina': 'America/Araguaina',
    'america/argentina/buenos_aires': 'America/Argentina/Buenos_Aires',
    'america/argentina/catamarca': 'America/Argentina/Catamarca',
    'america/argentina/cordoba': 'America/Argentina/Cordoba',
    'america/argentina/jujuy': 'America/Argentina/Jujuy',
    'america/argentina/la_rioja': 'America/Argentina/La_Rioja',
    'america/argentina/mendoza': 'America/Argentina/Mendoza',
    'america/argentina/rio_gallegos': 'America/Argentina/Rio_Gallegos',
    'america/argentina/salta': 'America/Argentina/Salta',
    'america/argentina/san_juan': 'America/Argentina/San_Juan',
    'america/argentina/san_luis': 'America/Argentina/San_Luis',
    'america/argentina/tucuman': 'America/Argentina/Tucuman',
    'america/argentina/ushuaia': 'America/Argentina/Ushuaia',
    'america/asuncion': 'America/Asuncion',
    'america/bahia': 'America/Bahia',
    'america/bahia_banderas': 'America/Bahia_Banderas',
    'america/barbados': 'America/Barbados',
    'america/belem': 'America/Belem',
    'america/belize': 'America/Belize',
    'america/boa_vista': 'America/Boa_Vista',
    'america/bogota': 'America/Bogota',
    'america/boise': 'America/Boise',
    'america/cambridge_bay': 'America/Cambridge_Bay',
    'america/campo_grande': 'America/Campo_Grande',
    'america/cancun': 'America/Cancun',
    'america/caracas': 'America/Caracas',
    'america/cayenne': 'America/Cayenne',
    'america/chicago': 'America/Chicago',
    'america/chihuahua': 'America/Chihuahua',
    'america/costa_rica': 'America/Costa_Rica',
    'america/cuiaba': 'America/Cuiaba',
    'america/danmarkshavn': 'America/Danmarkshavn',
    'america/dawson': 'America/Dawson',
    'america/dawson_creek': 'America/Dawson_Creek',
    'america/denver': 'America/Denver',
    'america/detroit': 'America/Detroit',
    'america/edmonton': 'America/Edmonton',
    'america/eirunepe': 'America/Eirunepe',
    'america/el_salvador': 'America/El_Salvador',
    'america/fort_nelson': 'America/Fort_Nelson',
    'america/fortaleza': 'America/Fortaleza',
    'america/glace_bay': 'America/Glace_Bay',
    'america/goose_bay': 'America/Goose_Bay',
    'america/grand_turk': 'America/Grand_Turk',
    'america/guatemala': 'America/Guatemala',
    'america/guayaquil': 'America/Guayaquil',
    'america/guyana': 'America/Guyana',
    'america/halifax': 'America/Halifax',
    'america/havana': 'America/Havana',
    'america/hermosillo': 'America/Hermosillo',
    'america/indiana/indianapolis': 'America/Indiana/Indianapolis',
    'america/indiana/knox': 'America/Indiana/Knox',
    'america/indiana/marengo': 'America/Indiana/Marengo',
    'america/indiana/petersburg': 'America/Indiana/Petersburg',
    'america/indiana/tell_city': 'America/Indiana/Tell_City',
    'america/indiana/vevay': 'America/Indiana/Vevay',
    'america/indiana/vincennes': 'America/Indiana/Vincennes',
    'america/indiana/winamac': 'America/Indiana/Winamac',
    'america/inuvik': 'America/Inuvik',
    'america/iqaluit': 'America/Iqaluit',
    'america/jamaica': 'America/Jamaica',
    'america/juneau': 'America/Juneau',
    'america/kentucky/louisville': 'America/Kentucky/Louisville',
    'america/kentucky/monticello': 'America/Kentucky/Monticello',
    'america/la_paz': 'America/La_Paz',
    'america/lima': 'America/Lima',
    'america/los_angeles': 'America/Los_Angeles',
    'america/maceio': 'America/Maceio',
    'america/managua': 'America/Managua',
    'america/manaus': 'America/Manaus',
    'america/martinique': 'America/Martinique',
    'america/matamoros': 'America/Matamoros',
    'america/mazatlan': 'America/Mazatlan',
    'america/menominee': 'America/Menominee',
    'america/merida': 'America/Merida',
    'america/metlakatla': 'America/Metlakatla',
    'america/mexico_city': 'America/Mexico_City',
    'america/miquelon': 'America/Miquelon',
    'america/moncton': 'America/Moncton',
    'america/monterrey': 'America/Monterrey',
    'america/montevideo': 'America/Montevideo',
    'america/new_york': 'America/New_York',
    'america/nome': 'America/Nome',
    'america/noronha': 'America/Noronha',
    'america/north_dakota/beulah': 'America/North_Dakota/Beulah',
    'america/north_dakota/center': 'America/North_Dakota/Center',
    'america/north_dakota/new_salem': 'America/North_Dakota/New_Salem',
    'america/nuuk': 'America/Nuuk',
    'america/ojinaga': 'America/Ojinaga',
    'america/panama': 'America/Panama',
    'america/paramaribo': 'America/Paramaribo',
    'america/phoenix': 'America/Phoenix',
    'america/port-au-prince': 'America/Port-au-Prince',
    'america/porto_velho': 'America/Porto_Velho',
    'america/puerto_rico': 'America/Puerto_Rico',
    'america/punta_arenas': 'America/Punta_Arenas',
    'america/rankin_inlet': 'America/Rankin_Inlet',
    'america/recife': 'America/Recife',
    'america/regina': 'America/Regina',
    'america/resolute': 'America/Resolute',
    'america/rio_branco': 'America/Rio_Branco',
    'america/santarem': 'America/Santarem',
    'america/santiago': 'America/Santiago',
    'america/santo_domingo': 'America/Santo_Domingo',
    'america/sao_paulo': 'America/Sao_Paulo',
    'america/scoresbysund': 'America/Scoresbysund',
    'america/sitka': 'America/Sitka',
    'america/st_johns': 'America/St_Johns',
    'america/swift_current': 'America/Swift_Current',
    'america/tegucigalpa': 'America/Tegucigalpa',
    'america/thule': 'America/Thule',
    'america/tijuana': 'America/Tijuana',
    'america/toronto': 'America/Toronto',
    'america/vancouver': 'America/Vancouver',
    'america/whitehorse': 'America/Whitehorse',
    'america/winnipeg': 'America/Winnipeg',
    'america/yakutat': 'America/Yakutat',
    'antarctica/casey': 'Antarctica/Casey',
    'antarctica/davis': 'Antarctica/Davis',
    'antarctica/macquarie': 'Antarctica/Macquarie',
    'antarctica/mawson': 'Antarctica/Mawson',
    'antarctica/palmer': 'Antarctica/Palmer',
    'antarctica/rothera': 'Antarctica/Rothera',
    'antarctica/troll': 'Antarctica/Troll',
    'antarctica/vostok': 'Antarctica/Vostok',
    'asia/almaty': 'Asia/Almaty',
    'asia/amman': 'Asia/Amman',
    'asia/anadyr': 'Asia/Anadyr',
    'asia/aqtau': 'Asia/Aqtau',
    'asia/aqtobe': 'Asia/Aqtobe',
    'asia/ashgabat': 'Asia/Ashgabat',
    'asia/atyrau': 'Asia/Atyrau',
    'asia/baghdad': 'Asia/Baghdad',
    'asia/baku': 'Asia/Baku',
    'asia/bangkok': 'Asia/Bangkok',
    'asia/barnaul': 'Asia/Barnaul',
    'asia/beirut': 'Asia/Beirut',
    'asia/bishkek': 'Asia/Bishkek',
    'asia/chita': 'Asia/Chita',
    'asia/choibalsan': 'Asia/Choibalsan',
    'asia/colombo': 'Asia/Colombo',
    'asia/damascus': 'Asia/Damascus',
    'asia/dhaka': 'Asia/Dhaka',
    'asia/dili': 'Asia/Dili',
    'asia/dubai': 'Asia/Dubai',
    'asia/dushanbe': 'Asia/Dushanbe',
    'asia/famagusta': 'Asia/Famagusta',
    'asia/gaza': 'Asia/Gaza',
    'asia/hebron': 'Asia/Hebron',
    'asia/ho_chi_minh': 'Asia/Ho_Chi_Minh',
    'asia/hong_kong': 'Asia/Hong_Kong',
    'asia/hovd': 'Asia/Hovd',
    'asia/irkutsk': 'Asia/Irkutsk',
    'asia/jakarta': 'Asia/Jakarta',
    'asia/jayapura': 'Asia/Jayapura',
    'asia/jerusalem': 'Asia/Jerusalem',
    'asia/kabul': 'Asia/Kabul',
    'asia/kamchatka': 'Asia/Kamchatka',
    'asia/karachi': 'Asia/Karachi',
    'asia/kathmandu': 'Asia/Kathmandu',
    'asia/khandyga': 'Asia/Khandyga',
    'asia/kolkata': 'Asia/Kolkata',
    'asia/krasnoyarsk': 'Asia/Krasnoyarsk',
    'asia/kuching': 'Asia/Kuching',
    'asia/macau': 'Asia/Macau',
    'asia/magadan': 'Asia/Magadan',
    'asia/makassar': 'Asia/Makassar',
    'asia/manila': 'Asia/Manila',
    'asia/nicosia': 'Asia/Nicosia',
    'asia/novokuznetsk': 'Asia/Novokuznetsk',
    'asia/novosibirsk': 'Asia/Novosibirsk',
    'asia/omsk': 'Asia/Omsk',
    'asia/oral': 'Asia/Oral',
    'asia/pontianak': 'Asia/Pontianak',
    'asia/pyongyang': 'Asia/Pyongyang',
    'asia/qatar': 'Asia/Qatar',
    'asia/qostanay': 'Asia/Qostanay',
    'asia/qyzylorda': 'Asia/Qyzylorda',
    'asia/riyadh': 'Asia/Riyadh',
    'asia/sakhalin': 'Asia/Sakhalin',
    'asia/samarkand': 'Asia/Samarkand',
    'asia/seoul': 'Asia/Seoul',
    'asia/shanghai': 'Asia/Shanghai',
    'asia/singapore': 'Asia/Singapore',
    'asia/srednekolymsk': 'Asia/Srednekolymsk',
    'asia/taipei': 'Asia/Taipei',
    'asia/tashkent': 'Asia/Tashkent',
    'asia/tbilisi': 'Asia/Tbilisi',
    'asia/tehran': 'Asia/Tehran',
    'asia/thimphu': 'Asia/Thimphu',
    'asia/tokyo': 'Asia/Tokyo',
    'asia/tomsk': 'Asia/Tomsk',
    'asia/ulaanbaatar': 'Asia/Ulaanbaatar',
    'asia/urumqi': 'Asia/Urumqi',
    'asia/ust-nera': 'Asia/Ust-Nera',
    'asia/vladivostok': 'Asia/Vladivostok',
    'asia/yakutsk': 'Asia/Yakutsk',
    'asia/yangon': 'Asia/Yangon',
    'asia/yekaterinburg': 'Asia/Yekaterinburg',
    'asia/yerevan': 'Asia/Yerevan',
    'atlantic/azores': 'Atlantic/Azores',
    'atlantic/bermuda': 'Atlantic/Bermuda',
    'atlantic/canary': 'Atlantic/Canary',
    'atlantic/cape_verde': 'Atlantic/Cape_Verde',
    'atlantic/faroe': 'Atlantic/Faroe',
    'atlantic/madeira': 'Atlantic/Madeira',
    'atlantic/south_georgia': 'Atlantic/South_Georgia',
    'atlantic/stanley': 'Atlantic/Stanley',
    'australia/adelaide': 'Australia/Adelaide',
    'australia/brisbane': 'Australia/Brisbane',
    'australia/broken_hill': 'Australia/Broken_Hill',
    'australia/darwin': 'Australia/Darwin',
    'australia/eucla': 'Australia/Eucla',
    'australia/hobart': 'Australia/Hobart',
    'australia/lindeman': 'Australia/Lindeman',
    'australia/lord_howe': 'Australia/Lord_Howe',
    'australia/melbourne': 'Australia/Melbourne',
    'australia/perth': 'Australia/Perth',
    'australia/sydney': 'Australia/Sydney',
    'cet': 'CET',
    'cst6cdt': 'CST6CDT',
    'eet': 'EET',
    'est': 'EST',
    'est5edt': 'EST5EDT',
    'etc/gmt': 'Etc/GMT',
    'etc/gmt-1': 'Etc/GMT-1',
    'etc/gmt-2': 'Etc/GMT-2',
    'etc/gmt-3': 'Etc/GMT-3',
    'etc/gmt-4': 'Etc/GMT-4',
    'etc/gmt-5': 'Etc/GMT-5',
    'etc/gmt-6': 'Etc/GMT-6',
    'etc/gmt-7': 'Etc/GMT-7',
    'etc/gmt-8': 'Etc/GMT-8',
    'etc/gmt-9': 'Etc/GMT-9',
    'etc/gmt-10': 'Etc/GMT-10',
    'etc/gmt-11': 'Etc/GMT-11',
    'etc/gmt-12': 'Etc/GMT-12',
    'etc/gmt-13': 'Etc/GMT-13',
    'etc/gmt-14': 'Etc/GMT-14',
    'etc/gmt+1': 'Etc/GMT+1',
    'etc/gmt+2': 'Etc/GMT+2',
    'etc/gmt+3': 'Etc/GMT+3',
    'etc/gmt+4': 'Etc/GMT+4',
    'etc/gmt+5': 'Etc/GMT+5',
    'etc/gmt+6': 'Etc/GMT+6',
    'etc/gmt+7': 'Etc/GMT+7',
    'etc/gmt+8': 'Etc/GMT+8',
    'etc/gmt+9': 'Etc/GMT+9',
    'etc/gmt+10': 'Etc/GMT+10',
    'etc/gmt+11': 'Etc/GMT+11',
    'etc/gmt+12': 'Etc/GMT+12',
    'etc/utc': 'Etc/UTC',
    'europe/andorra': 'Europe/Andorra',
    'europe/astrakhan': 'Europe/Astrakhan',
    'europe/athens': 'Europe/Athens',
    'europe/belgrade': 'Europe/Belgrade',
    'europe/berlin': 'Europe/Berlin',
    'europe/brussels': 'Europe/Brussels',
    'europe/bucharest': 'Europe/Bucharest',
    'europe/budapest': 'Europe/Budapest',
    'europe/chisinau': 'Europe/Chisinau',
    'europe/dublin': 'Europe/Dublin',
    'europe/gibraltar': 'Europe/Gibraltar',
    'europe/helsinki': 'Europe/Helsinki',
    'europe/istanbul': 'Europe/Istanbul',
    'europe/kaliningrad': 'Europe/Kaliningrad',
    'europe/kirov': 'Europe/Kirov',
    'europe/kyiv': 'Europe/Kyiv',
    'europe/lisbon': 'Europe/Lisbon',
    'europe/london': 'Europe/London',
    'europe/madrid': 'Europe/Madrid',
    'europe/malta': 'Europe/Malta',
    'europe/minsk': 'Europe/Minsk',
    'europe/moscow': 'Europe/Moscow',
    'europe/paris': 'Europe/Paris',
    'europe/prague': 'Europe/Prague',
    'europe/riga': 'Europe/Riga',
    'europe/rome': 'Europe/Rome',
    'europe/samara': 'Europe/Samara',
    'europe/saratov': 'Europe/Saratov',
    'europe/simferopol': 'Europe/Simferopol',
    'europe/sofia': 'Europe/Sofia',
    'europe/tallinn': 'Europe/Tallinn',
    'europe/tirane': 'Europe/Tirane',
    'europe/ulyanovsk': 'Europe/Ulyanovsk',
    'europe/vienna': 'Europe/Vienna',
    'europe/vilnius': 'Europe/Vilnius',
    'europe/volgograd': 'Europe/Volgograd',
    'europe/warsaw': 'Europe/Warsaw',
    'europe/zurich': 'Europe/Zurich',
    'factory': 'Factory',
    'hst': 'HST',
    'indian/chagos': 'Indian/Chagos',
    'indian/maldives': 'Indian/Maldives',
    'indian/mauritius': 'Indian/Mauritius',
    'met': 'MET',
    'mst': 'MST',
    'mst7mdt': 'MST7MDT',
    'pacific/apia': 'Pacific/Apia',
    'pacific/auckland': 'Pacific/Auckland',
    'pacific/bougainville': 'Pacific/Bougainville',
    'pacific/chatham': 'Pacific/Chatham',
    'pacific/easter': 'Pacific/Easter',
    'pacific/efate': 'Pacific/Efate',
    'pacific/fakaofo': 'Pacific/Fakaofo',
    'pacific/fiji': 'Pacific/Fiji',
    'pacific/galapagos': 'Pacific/Galapagos',
    'pacific/gambier': 'Pacific/Gambier',
    'pacific/guadalcanal': 'Pacific/Guadalcanal',
    'pacific/guam': 'Pacific/Guam',
    'pacific/honolulu': 'Pacific/Honolulu',
    'pacific/kanton': 'Pacific/Kanton',
    'pacific/kiritimati': 'Pacific/Kiritimati',
    'pacific/kosrae': 'Pacific/Kosrae',
    'pacific/kwajalein': 'Pacific/Kwajalein',
    'pacific/marquesas': 'Pacific/Marquesas',
    'pacific/nauru': 'Pacific/Nauru',
    'pacific/niue': 'Pacific/Niue',
    'pacific/norfolk': 'Pacific/Norfolk',
    'pacific/noumea': 'Pacific/Noumea',
    'pacific/pago_pago': 'Pacific/Pago_Pago',
    'pacific/palau': 'Pacific/Palau',
    'pacific/pitcairn': 'Pacific/Pitcairn',
    'pacific/port_moresby': 'Pacific/Port_Moresby',
    'pacific/rarotonga': 'Pacific/Rarotonga',
    'pacific/tahiti': 'Pacific/Tahiti',
    'pacific/tarawa': 'Pacific/Tarawa',
    'pacific/tongatapu': 'Pacific/Tongatapu',
    'pst8pdt': 'PST8PDT',
    'wet': 'WET',
    'ast': 'AST',
    'cat': 'CAT',
    'cst': 'CST',
    'eat': 'EAT',
    'gmt': 'GMT',
    'bst': 'BST',
    'jst': 'JST',
    'nst': 'NST',
    'pst': 'PST',
    'sst': 'SST',
    'utc': 'UTC',
    'etc/uct': 'Etc/UCT',
    'america/godthab': 'America/Nuuk',
    'brazil/denoronha': 'America/Noronha',
    'america/buenos_aires': 'America/Argentina/Buenos_Aires',
    'america/catamarca': 'America/Argentina/Catamarca',
    'america/cordoba': 'America/Argentina/Cordoba',
    'america/jujuy': 'America/Argentina/Jujuy',
    'america/mendoza': 'America/Argentina/Mendoza',
    'brazil/east': 'America/Sao_Paulo',
    'brazil/west': 'America/Manaus',
    'chile/continental': 'America/Santiago',
    'america/porto_acre': 'America/Rio_Branco',
    'brazil/acre': 'America/Rio_Branco',
    'chile/easterisland': 'Pacific/Easter',
    'asia/istanbul': 'Europe/Istanbul',
    'turkey': 'Europe/Istanbul',
    'asia/ashkhabad': 'Asia/Ashgabat',
    'asia/dacca': 'Asia/Dhaka',
    'asia/thimbu': 'Asia/Thimphu',
    'asia/saigon': 'Asia/Ho_Chi_Minh',
    'asia/ulan_bator': 'Asia/Ulaanbaatar',
    'singapore': 'Asia/Singapore',
    'pacific/truk': 'Pacific/Port_Moresby',
    'pacific/yap': 'Pacific/Port_Moresby',
    'pacific/ponape': 'Pacific/Guadalcanal',
    'kwajalein': 'Pacific/Kwajalein',
    'iran': 'Asia/Tehran',
    'asia/katmandu': 'Asia/Kathmandu',
    'asia/rangoon': 'Asia/Yangon',
    'australia/lhi': 'Australia/Lord_Howe',
    'nz-chat': 'Pacific/Chatham',
    'australia/north': 'Australia/Darwin',
    'australia/south': 'Australia/Adelaide',
    'australia/yancowinna': 'Australia/Broken_Hill',
    'australia/act': 'Australia/Sydney',
    'australia/canberra': 'Australia/Sydney',
    'australia/nsw': 'Australia/Sydney',
    'australia/queensland': 'Australia/Brisbane',
    'australia/tasmania': 'Australia/Hobart',
    'australia/victoria': 'Australia/Melbourne',
    'us/alaska': 'America/Anchorage',
    'america/kralendijk': 'America/Puerto_Rico',
    'america/lower_princes': 'America/Puerto_Rico',
    'america/marigot': 'America/Puerto_Rico',
    'america/st_barthelemy': 'America/Puerto_Rico',
    'america/virgin': 'America/Puerto_Rico',
    'canada/atlantic': 'America/Halifax',
    'australia/west': 'Australia/Perth',
    'arctic/longyearbyen': 'Europe/Berlin',
    'europe/bratislava': 'Europe/Prague',
    'europe/busingen': 'Europe/Zurich',
    'europe/podgorica': 'Europe/Belgrade',
    'europe/san_marino': 'Europe/Rome',
    'europe/vatican': 'Europe/Rome',
    'poland': 'Europe/Warsaw',
    'america/knox_in': 'America/Indiana/Knox',
    'asia/chungking': 'Asia/Shanghai',
    'asia/macao': 'Asia/Macau',
    'canada/central': 'America/Winnipeg',
    'canada/saskatchewan': 'America/Regina',
    'cuba': 'America/Havana',
    'mexico/general': 'America/Mexico_City',
    'prc': 'Asia/Shanghai',
    'roc': 'Asia/Taipei',
    'us/central': 'America/Chicago',
    'us/indiana-starke': 'America/Indiana/Knox',
    'africa/asmera': 'Africa/Nairobi',
    'egypt': 'Africa/Cairo',
    'europe/kiev': 'Europe/Kyiv',
    'europe/mariehamn': 'Europe/Helsinki',
    'europe/nicosia': 'Asia/Nicosia',
    'libya': 'Africa/Tripoli',
    'america/fort_wayne': 'America/Indiana/Indianapolis',
    'america/indianapolis': 'America/Indiana/Indianapolis',
    'america/louisville': 'America/Kentucky/Louisville',
    'canada/eastern': 'America/Toronto',
    'jamaica': 'America/Jamaica',
    'us/east-indiana': 'America/Indiana/Indianapolis',
    'us/eastern': 'America/New_York',
    'us/michigan': 'America/Detroit',
    'etc/gmt+0': 'Etc/GMT',
    'etc/gmt-0': 'Etc/GMT',
    'etc/gmt0': 'Etc/GMT',
    'etc/greenwich': 'Etc/GMT',
    'gb': 'Europe/London',
    'gb-eire': 'Europe/London',
    'gmt': 'Etc/GMT',
    'gmt+0': 'Etc/GMT',
    'gmt-0': 'Etc/GMT',
    'gmt0': 'Etc/GMT',
    'greenwich': 'Etc/GMT',
    'iceland': 'Africa/Abidjan',
    'hongkong': 'Asia/Hong_Kong',
    'america/atka': 'America/Adak',
    'us/aleutian': 'America/Adak',
    'us/hawaii': 'Pacific/Honolulu',
    'asia/calcutta': 'Asia/Kolkata',
    'eire': 'Europe/Dublin',
    'israel': 'Asia/Jerusalem',
    'japan': 'Asia/Tokyo',
    'rok': 'Asia/Seoul',
    'w-su': 'Europe/Moscow',
    'america/shiprock': 'America/Denver',
    'canada/mountain': 'America/Edmonton',
    'canada/yukon': 'America/Whitehorse',
    'mexico/bajasur': 'America/Mazatlan',
    'navajo': 'America/Denver',
    'us/arizona': 'America/Phoenix',
    'us/mountain': 'America/Denver',
    'canada/newfoundland': 'America/St_Johns',
    'antarctica/south_pole': 'Pacific/Auckland',
    'nz': 'Pacific/Auckland',
    'america/santa_isabel': 'America/Tijuana',
    'canada/pacific': 'America/Vancouver',
    'mexico/bajanorte': 'America/Tijuana',
    'us/pacific': 'America/Los_Angeles',
    'pacific/samoa': 'Pacific/Pago_Pago',
    'us/samoa': 'Pacific/Pago_Pago',
    'etc/uct': 'Etc/UTC',
    'etc/universal': 'Etc/UTC',
    'etc/zulu': 'Etc/UTC',
    'uct': 'Etc/UTC',
    'universal': 'Etc/UTC',
    'utc': 'Etc/UTC',
    'zulu': 'Etc/UTC',
    'atlantic/faeroe': 'Atlantic/Faroe',
    'portugal': 'Europe/Lisbon',
    'asia/ujung_pandang': 'Asia/Makassar',
    'america/argentina/comodrivadavia': 'America/Argentina/Catamarca',
    'america/rosario': 'America/Argentina/Cordoba',
    'antarctica/syowa': 'Asia/Riyadh',
    'asia/aden': 'Asia/Riyadh',
    'asia/bahrain': 'Asia/Qatar',
    'asia/kuwait': 'Asia/Riyadh',
    'asia/muscat': 'Asia/Dubai',
    'indian/mahe': 'Asia/Dubai',
    'indian/reunion': 'Asia/Dubai',
    'indian/kerguelen': 'Indian/Maldives',
    'asia/kashgar': 'Asia/Urumqi',
    'asia/phnom_penh': 'Asia/Bangkok',
    'asia/vientiane': 'Asia/Bangkok',
    'indian/christmas': 'Asia/Bangkok',
    'asia/brunei': 'Asia/Kuching',
    'asia/kuala_lumpur': 'Asia/Singapore',
    'antarctica/dumontdurville': 'Pacific/Port_Moresby',
    'pacific/chuuk': 'Pacific/Port_Moresby',
    'pacific/pohnpei': 'Pacific/Guadalcanal',
    'pacific/funafuti': 'Pacific/Tarawa',
    'pacific/majuro': 'Pacific/Tarawa',
    'pacific/wake': 'Pacific/Tarawa',
    'pacific/wallis': 'Pacific/Tarawa',
    'pacific/enderbury': 'Pacific/Kanton',
    'indian/cocos': 'Asia/Yangon',
    'australia/currie': 'Australia/Hobart',
    'america/anguilla': 'America/Puerto_Rico',
    'america/antigua': 'America/Puerto_Rico',
    'america/aruba': 'America/Puerto_Rico',
    'america/blanc-sablon': 'America/Puerto_Rico',
    'america/curacao': 'America/Puerto_Rico',
    'america/dominica': 'America/Puerto_Rico',
    'america/grenada': 'America/Puerto_Rico',
    'america/guadeloupe': 'America/Puerto_Rico',
    'america/montserrat': 'America/Puerto_Rico',
    'america/port_of_spain': 'America/Puerto_Rico',
    'america/st_kitts': 'America/Puerto_Rico',
    'america/st_lucia': 'America/Puerto_Rico',
    'america/st_thomas': 'America/Puerto_Rico',
    'america/st_vincent': 'America/Puerto_Rico',
    'america/tortola': 'America/Puerto_Rico',
    'africa/blantyre': 'Africa/Maputo',
    'africa/bujumbura': 'Africa/Maputo',
    'africa/gaborone': 'Africa/Maputo',
    'africa/harare': 'Africa/Maputo',
    'africa/kigali': 'Africa/Maputo',
    'africa/lubumbashi': 'Africa/Maputo',
    'africa/lusaka': 'Africa/Maputo',
    'atlantic/jan_mayen': 'Europe/Berlin',
    'europe/amsterdam': 'Europe/Brussels',
    'europe/copenhagen': 'Europe/Berlin',
    'europe/ljubljana': 'Europe/Belgrade',
    'europe/luxembourg': 'Europe/Brussels',
    'europe/monaco': 'Europe/Paris',
    'europe/oslo': 'Europe/Berlin',
    'europe/sarajevo': 'Europe/Belgrade',
    'europe/skopje': 'Europe/Belgrade',
    'europe/stockholm': 'Europe/Berlin',
    'europe/vaduz': 'Europe/Zurich',
    'europe/zagreb': 'Europe/Belgrade',
    'pacific/saipan': 'Pacific/Guam',
    'america/rainy_river': 'America/Winnipeg',
    'asia/chongqing': 'Asia/Shanghai',
    'asia/harbin': 'Asia/Shanghai',
    'africa/addis_ababa': 'Africa/Nairobi',
    'africa/asmara': 'Africa/Nairobi',
    'africa/dar_es_salaam': 'Africa/Nairobi',
    'africa/djibouti': 'Africa/Nairobi',
    'africa/kampala': 'Africa/Nairobi',
    'africa/mogadishu': 'Africa/Nairobi',
    'indian/antananarivo': 'Africa/Nairobi',
    'indian/comoro': 'Africa/Nairobi',
    'indian/mayotte': 'Africa/Nairobi',
    'europe/tiraspol': 'Europe/Chisinau',
    'europe/uzhgorod': 'Europe/Kyiv',
    'europe/zaporozhye': 'Europe/Kyiv',
    'america/atikokan': 'America/Panama',
    'america/cayman': 'America/Panama',
    'america/coral_harbour': 'America/Panama',
    'america/montreal': 'America/Toronto',
    'america/nassau': 'America/Toronto',
    'america/nipigon': 'America/Toronto',
    'america/pangnirtung': 'America/Iqaluit',
    'america/thunder_bay': 'America/Toronto',
    'africa/accra': 'Africa/Abidjan',
    'africa/bamako': 'Africa/Abidjan',
    'africa/banjul': 'Africa/Abidjan',
    'africa/conakry': 'Africa/Abidjan',
    'africa/dakar': 'Africa/Abidjan',
    'africa/freetown': 'Africa/Abidjan',
    'africa/lome': 'Africa/Abidjan',
    'africa/nouakchott': 'Africa/Abidjan',
    'africa/ouagadougou': 'Africa/Abidjan',
    'africa/timbuktu': 'Africa/Abidjan',
    'atlantic/reykjavik': 'Africa/Abidjan',
    'atlantic/st_helena': 'Africa/Abidjan',
    'europe/belfast': 'Europe/London',
    'europe/guernsey': 'Europe/London',
    'europe/isle_of_man': 'Europe/London',
    'europe/jersey': 'Europe/London',
    'pacific/johnston': 'Pacific/Honolulu',
    'asia/tel_aviv': 'Asia/Jerusalem',
    'america/creston': 'America/Phoenix',
    'america/yellowknife': 'America/Edmonton',
    'antarctica/mcmurdo': 'Pacific/Auckland',
    'america/ensenada': 'America/Tijuana',
    'africa/maseru': 'Africa/Johannesburg',
    'africa/mbabane': 'Africa/Johannesburg',
    'pacific/midway': 'Pacific/Pago_Pago',
    'africa/bangui': 'Africa/Lagos',
    'africa/brazzaville': 'Africa/Lagos',
    'africa/douala': 'Africa/Lagos',
    'africa/kinshasa': 'Africa/Lagos',
    'africa/libreville': 'Africa/Lagos',
    'africa/luanda': 'Africa/Lagos',
    'africa/malabo': 'Africa/Lagos',
    'africa/niamey': 'Africa/Lagos',
    'africa/porto-novo': 'Africa/Lagos'
}

const validLocales = {
    'af-za': 'af-ZA',
    'sq-al': 'sq-AL',
    'ar-dz': 'ar-DZ',
    'ar-bh': 'ar-BH',
    'ar-eg': 'ar-EG',
    'ar-iq': 'ar-IQ',
    'ar-jo': 'ar-JO',
    'ar-kw': 'ar-KW',
    'ar-lb': 'ar-LB',
    'ar-ly': 'ar-LY',
    'ar-ma': 'ar-MA',
    'ar-om': 'ar-OM',
    'ar-qa': 'ar-QA',
    'ar-sa': 'ar-SA',
    'ar-sy': 'ar-SY',
    'ar-tn': 'ar-TN',
    'ar-ae': 'ar-AE',
    'ar-ye': 'ar-YE',
    'hy-am': 'hy-AM',
    'az-az': 'az-AZ',
    'eu-es': 'eu-ES',
    'be-by': 'be-BY',
    'bn-in': 'bn-IN',
    'bs-ba': 'bs-BA',
    'bg-bg': 'bg-BG',
    'ca-es': 'ca-ES',
    'zh-cn': 'zh-CN',
    'zh-hk': 'zh-HK',
    'zh-mo': 'zh-MO',
    'zh-sg': 'zh-SG',
    'zh-tw': 'zh-TW',
    'hr-hr': 'hr-HR',
    'cs-cz': 'cs-CZ',
    'da-dk': 'da-DK',
    'nl-be': 'nl-BE',
    'nl-nl': 'nl-NL',
    'en-au': 'en-AU',
    'en-bz': 'en-BZ',
    'en-ca': 'en-CA',
    'en-ie': 'en-IE',
    'en-jm': 'en-JM',
    'en-nz': 'en-NZ',
    'en-ph': 'en-PH',
    'en-za': 'en-ZA',
    'en-tt': 'en-TT',
    'en-vi': 'en-VI',
    'en-gb': 'en-GB',
    'en-us': 'en-US',
    'en-zw': 'en-ZW',
    'et-ee': 'et-EE',
    'fo-fo': 'fo-FO',
    'fi-fi': 'fi-FI',
    'fr-be': 'fr-BE',
    'fr-ca': 'fr-CA',
    'fr-fr': 'fr-FR',
    'fr-lu': 'fr-LU',
    'fr-mc': 'fr-MC',
    'fr-ch': 'fr-CH',
    'gl-es': 'gl-ES',
    'ka-ge': 'ka-GE',
    'de-at': 'de-AT',
    'de-de': 'de-DE',
    'de-li': 'de-LI',
    'de-lu': 'de-LU',
    'de-ch': 'de-CH',
    'el-gr': 'el-GR',
    'gu-in': 'gu-IN',
    'he-il': 'he-IL',
    'hi-in': 'hi-IN',
    'hu-hu': 'hu-HU',
    'is-is': 'is-IS',
    'id-id': 'id-ID',
    'it-it': 'it-IT',
    'it-ch': 'it-CH',
    'ja-jp': 'ja-JP',
    'kn-in': 'kn-IN',
    'kk-kz': 'kk-KZ',
    'kok-in': 'kok-IN',
    'ko-kr': 'ko-KR',
    'lv-lv': 'lv-LV',
    'lt-lt': 'lt-LT',
    'mk-mk': 'mk-MK',
    'ms-bn': 'ms-BN',
    'ms-my': 'ms-MY',
    'ml-in': 'ml-IN',
    'mt-mt': 'mt-MT',
    'mr-in': 'mr-IN',
    'mn-mn': 'mn-MN',
    'se-no': 'se-NO',
    'nb-no': 'nb-NO',
    'nn-no': 'nn-NO',
    'fa-ir': 'fa-IR',
    'pl-pl': 'pl-PL',
    'pt-br': 'pt-BR',
    'pt-pt': 'pt-PT',
    'pa-in': 'pa-IN',
    'ro-ro': 'ro-RO',
    'ru-ru': 'ru-RU',
    'sr-ba': 'sr-BA',
    'sr-cs': 'sr-CS',
    'sk-sk': 'sk-SK',
    'sl-si': 'sl-SI',
    'es-ar': 'es-AR',
    'es-bo': 'es-BO',
    'es-cl': 'es-CL',
    'es-co': 'es-CO',
    'es-cr': 'es-CR',
    'es-do': 'es-DO',
    'es-ec': 'es-EC',
    'es-sv': 'es-SV',
    'es-gt': 'es-GT',
    'es-hn': 'es-HN',
    'es-mx': 'es-MX',
    'es-ni': 'es-NI',
    'es-pa': 'es-PA',
    'es-py': 'es-PY',
    'es-pe': 'es-PE',
    'es-pr': 'es-PR',
    'es-es': 'es-ES',
    'es-uy': 'es-UY',
    'es-ve': 'es-VE',
    'sw-ke': 'sw-KE',
    'sv-fi': 'sv-FI',
    'sv-se': 'sv-SE',
    'syr-sy': 'syr-SY',
    'ta-in': 'ta-IN',
    'te-in': 'te-IN',
    'th-th': 'th-TH',
    'tn-za': 'tn-ZA',
    'tr-tr': 'tr-TR',
    'uk-ua': 'uk-UA',
    'uz-uz': 'uz-UZ',
    'vi-vn': 'vi-VN',
    'cy-gb': 'cy-GB',
    'xh-za': 'xh-ZA',
    'zu-za': 'zu-ZA'
}

module.exports = {
    getTime(props) {
        const { bot, chatroom, args, currentTime } = props
        const tz = args[0] || settings.timeZone
        const lang = args[1] || settings.timeLocale
        logMessage([`> getTime(chatroom: ${chatroom}, tz: ${tz}, lang: ${lang})`])

        const zone = tz.toLowerCase() in validTimeZones ? validTimeZones[tz.toLowerCase()] : settings.timeZone
        const locale = lang.toLowerCase() in validLocales ? validLocales[lang.toLowerCase()] : settings.timeLocale

        const date = new Date(currentTime).toLocaleDateString(locale, { weekday: `short`, year: `numeric`, month: `short`, day: `numeric`, timeZone: zone })
        const time = new Date(currentTime).toLocaleTimeString(locale, { timeZone: zone })

        const neutralEmote = getNeutralEmote(chatroom.substring(1))
        bot.say(chatroom, `The current time is ${time} ${zone} on ${date}! ${neutralEmote}`)
    }
}
