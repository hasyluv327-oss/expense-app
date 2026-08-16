'use strict';

// ── Users ────────────────────────────────────────────────────────────────────
const USERS = {
  tanaka:   { id: 'tanaka',   name: '田中 太郎', role: 'employee', dept: '営業部',  initial: '田', title: '一般社員', color: '#4F46E5' },
  sato:     { id: 'sato',     name: '佐藤 花子', role: 'employee', dept: '企画部',  initial: '佐', title: '一般社員', color: '#0284C7' },
  suzuki:   { id: 'suzuki',   name: '鈴木 次郎', role: 'employee', dept: '総務部',  initial: '鈴', title: '一般社員', color: '#059669' },
  yamada:   { id: 'yamada',   name: '山田 健一', role: 'manager',  dept: '管理本部', initial: '山', title: '部長',    color: '#D97706' },
  nakamura: { id: 'nakamura', name: '中村 さき', role: 'finance',  dept: '経理部',  initial: '中', title: '経理担当', color: '#7C3AED' },
};

// ── Category-specific required extra fields ──────────────────────────────────
const CATEGORY_EXTRA = {
  '交通費': [
    { id: 'route', label: '経路', placeholder: '例: 東京→大阪（新幹線）', required: true },
  ],
  '会議費': [
    { id: 'attendees', label: '参加者', placeholder: '例: 山田部長、田中、外部1名', required: true },
    { id: 'purpose',   label: '会議の目的', placeholder: '例: 第2四半期レビュー', required: true },
  ],
  '接待費': [
    { id: 'client',    label: '相手先（会社・氏名）', placeholder: '例: ○○株式会社 鈴木様', required: true },
    { id: 'attendees', label: '参加人数・内訳', placeholder: '例: 4名（社内2名、先方2名）', required: true },
  ],
  '宿泊費': [
    { id: 'destination', label: '出張先', placeholder: '例: 大阪', required: true },
    { id: 'nights',      label: '泊数', placeholder: '例: 2泊', required: false },
  ],
};

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_LABEL = {
  pending:              '上長承認待ち',
  manager_approved:     '経理確認待ち',
  finance_pending:      '経理承認済み',
  finance_processing:   '精算処理待ち',
  settled:              '精算済み',
  rejected:             '差し戻し',
};

function currentApproverText(e) {
  switch (e.status) {
    case 'pending':            return '山田 健一（部長）';
    case 'manager_approved':   return '中村 さき（経理）';
    case 'finance_pending':
    case 'finance_processing': return '中村 さき（経理）';
    default: return null;
  }
}

// ── Dummy receipt images (SVG data URIs) ─────────────────────────────────────
const RECEIPT_IMGS = {
  receipt_jr:         'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzU4IiB2aWV3Qm94PSIwIDAgNDAwIDM1OCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzNTgiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MiIgZmlsbD0iIzAyODRDNyIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPumgmCDlj44g5pu4PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iNDEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODUpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5KUuadseaXpeacrOOAgOadseS6rOmnhTwvdGV4dD4KICA8bGluZSB4MT0iMTYiIHkxPSI2MCIgeDI9IjM4NCIgeTI9IjYwIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjI0IiB5PSI3OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiPuWPl+mgmE5vLjwvdGV4dD4KICA8dGV4dCB4PSIxMTAiIHk9Ijc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMzc0MTUxIj5USzIwMjYwNjAyLTA4NDc8L3RleHQ+CiAgPHRleHQgeD0iMjgwIiB5PSI3OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJlbmQiPueZuuihjOaXpTwvdGV4dD4KICA8dGV4dCB4PSIzODUiIHk9Ijc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj4yMDI2LTA2LTAyPC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9Ijg4IiB4Mj0iMzg0IiB5Mj0iODgiIHN0cm9rZT0iI0YzRjRGNiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMjQiIHk9IjEwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiPuWTgeebrjwvdGV4dD4KICA8dGV4dCB4PSIzMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJlbmQiPuaVsOmHj8OX5Y2Y5L6hPC90ZXh0PgogIDx0ZXh0IHg9IjM4MCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+5bCP6KiIPC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9IjExMiIgeDI9IjM4NCIgeTI9IjExMiIgc3Ryb2tlPSIjRTVFN0VCIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIyNCIgeT0iMTMwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAPC90ZXh0PgogIAogICAgICAgIDx0ZXh0IHg9IjI0IiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiPuadsea1t+mBk+aWsOW5uee3miDmnbHkuqzihpLmlrDlpKfpmKo8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzAwIiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiIHRleHQtYW5jaG9yPSJlbmQiPjE0LDUyMMOXMTwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzODAiIHk9IjE3OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzExMTgyNyIgdGV4dC1hbmNob3I9ImVuZCI+wqUxNCw1MjA8L3RleHQ+CiAgICAgICAgCiAgICAgICAgPHRleHQgeD0iMjQiIHk9IjE5OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSI+5p2x5rW36YGT5paw5bm557eaIOaWsOWkp+mYquKGkuadseS6rDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzMDAiIHk9IjE5OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9ImVuZCI+MTQsNTIww5cxPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMTk4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMTExODI3IiB0ZXh0LWFuY2hvcj0iZW5kIj7CpTE0LDUyMDwvdGV4dD4KICAgICAgICAKICA8bGluZSB4MT0iMTYiIHkxPSIyMjAiIHgyPSIzODQiIHkyPSIyMjAiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQsMyIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjQyIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5raI6LK756iO77yIMTAl77yJ6L6844G/PC90ZXh0PgogIDxyZWN0IHg9IjE2IiB5PSIyNTIiIHdpZHRoPSIzNjgiIGhlaWdodD0iNTIiIHJ4PSI4IiBmaWxsPSIjMDI4NEM3IiBvcGFjaXR5PSIwLjA4Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjI4NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwMjg0QzciIGZvbnQtd2VpZ2h0PSJib2xkIj7lkIgg6KiIPC90ZXh0PgogIDx0ZXh0IHg9IjM3NSIgeT0iMjg1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjIyIiBmaWxsPSIjMDI4NEM3IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+wqUyOSwwNDA8L3RleHQ+CiAgPHRleHQgeD0iMzc1IiB5PSIyOTgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJlbmQiPuOBhuOBoea2iOiyu+eojiDCpTIsNjQwPC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMzI2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmaWxsPSIjRDFENURCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIroqJjjga7pgJrjgorpoJjlj47jgYTjgZ/jgZfjgb7jgZfjgZ88L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIzNDAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIGZpbGw9IiNEMUQ1REIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpS5p2x5pel5pys44CA5p2x5Lqs6aeFPC90ZXh0Pgo8L3N2Zz4=',
  receipt_starbucks: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzc4IiB2aWV3Qm94PSIwIDAgNDAwIDM3OCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzNzgiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MiIgZmlsbD0iIzA1OTY2OSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPumgmCDlj44g5pu4PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iNDEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODUpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jgrnjgr/jg7zjg5Djg4Pjgq/jgrkg5Li444Gu5YaF5bqXPC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9IjYwIiB4Mj0iMzg0IiB5Mj0iNjAiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMjQiIHk9Ijc4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+5Y+X6aCYTm8uPC90ZXh0PgogIDx0ZXh0IHg9IjExMCIgeT0iNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzNzQxNTEiPlNCLTA2MDUtMTE0MjwvdGV4dD4KICA8dGV4dCB4PSIyODAiIHk9Ijc4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+55m66KGM5pelPC90ZXh0PgogIDx0ZXh0IHg9IjM4NSIgeT0iNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzNzQxNTEiIHRleHQtYW5jaG9yPSJlbmQiPjIwMjYtMDYtMDU8L3RleHQ+CiAgPGxpbmUgeDE9IjE2IiB5MT0iODgiIHgyPSIzODQiIHkyPSI4OCIgc3Ryb2tlPSIjRjNGNEY2IiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIyNCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+5ZOB55uuPC90ZXh0PgogIDx0ZXh0IHg9IjMwMCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+5pWw6YePw5fljZjkvqE8L3RleHQ+CiAgPHRleHQgeD0iMzgwIiB5PSIxMDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0iZW5kIj7lsI/oqIg8L3RleHQ+CiAgPGxpbmUgeDE9IjE2IiB5MT0iMTEyIiB4Mj0iMzg0IiB5Mj0iMTEyIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjI0IiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIj7ilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIA8L3RleHQ+CiAgCiAgICAgICAgPHRleHQgeD0iMjQiIHk9IjE3OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSI+44Kr44OV44Kn44Op44OG77yI44Kw44Op44Oz44OH77yJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjMwMCIgeT0iMTc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj42ODDDlzI8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlMSwzNjA8L3RleHQ+CiAgICAgICAgCiAgICAgICAgPHRleHQgeD0iMjQiIHk9IjE5OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSI+44Kt44Oj44Op44Oh44Or44Oe44Kt44Ki44O844OIPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjMwMCIgeT0iMTk4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj43MDDDlzE8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxOTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlNzAwPC90ZXh0PgogICAgICAgIAogICAgICAgIDx0ZXh0IHg9IjI0IiB5PSIyMTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiPuODnuODleOCo+ODszwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzMDAiIHk9IjIxOCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9ImVuZCI+MzQww5cxPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjE4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMTExODI3IiB0ZXh0LWFuY2hvcj0iZW5kIj7CpTM0MDwvdGV4dD4KICAgICAgICAKICA8bGluZSB4MT0iMTYiIHkxPSIyNDAiIHgyPSIzODQiIHkyPSIyNDAiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQsMyIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjYyIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5raI6LK756iO77yIMTAl77yJ6L6844G/PC90ZXh0PgogIDxyZWN0IHg9IjE2IiB5PSIyNzIiIHdpZHRoPSIzNjgiIGhlaWdodD0iNTIiIHJ4PSI4IiBmaWxsPSIjMDU5NjY5IiBvcGFjaXR5PSIwLjA4Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjMwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMwNTk2NjkiIGZvbnQtd2VpZ2h0PSJib2xkIj7lkIgg6KiIPC90ZXh0PgogIDx0ZXh0IHg9IjM3NSIgeT0iMzA1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjIyIiBmaWxsPSIjMDU5NjY5IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+wqUyLDQwMDwvdGV4dD4KICA8dGV4dCB4PSIzNzUiIHk9IjMxOCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9ImVuZCI+44GG44Gh5raI6LK756iOIMKlMjE4PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMzQ2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmaWxsPSIjRDFENURCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIroqJjjga7pgJrjgorpoJjlj47jgYTjgZ/jgZfjgb7jgZfjgZ88L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIGZpbGw9IiNEMUQ1REIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuOCueOCv+ODvOODkOODg+OCr+OCuSDkuLjjga7lhoXlupc8L3RleHQ+Cjwvc3ZnPg==',
  receipt_hotel:     'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzU4IiB2aWV3Qm94PSIwIDAgNDAwIDM1OCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzNTgiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MiIgZmlsbD0iIzdDM0FFRCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPumgmCDlj44g5pu4PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iNDEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODUpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg5vjg4bjg6vjgrDjg6njg7Pjg7TjgqPjgqLlpKfpmKo8L3RleHQ+CiAgPGxpbmUgeDE9IjE2IiB5MT0iNjAiIHgyPSIzODQiIHkyPSI2MCIgc3Ryb2tlPSIjRTVFN0VCIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIyNCIgeT0iNzgiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIj7lj5fpoJhOby48L3RleHQ+CiAgPHRleHQgeD0iMTEwIiB5PSI3OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzM3NDE1MSI+SEdPLTIwMjYwNjA5LTMzMTI8L3RleHQ+CiAgPHRleHQgeD0iMjgwIiB5PSI3OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJlbmQiPueZuuihjOaXpTwvdGV4dD4KICA8dGV4dCB4PSIzODUiIHk9Ijc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj4yMDI2LTA2LTA5PC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9Ijg4IiB4Mj0iMzg0IiB5Mj0iODgiIHN0cm9rZT0iI0YzRjRGNiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMjQiIHk9IjEwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiPuWTgeebrjwvdGV4dD4KICA8dGV4dCB4PSIzMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJlbmQiPuaVsOmHj8OX5Y2Y5L6hPC90ZXh0PgogIDx0ZXh0IHg9IjM4MCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+5bCP6KiIPC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9IjExMiIgeDI9IjM4NCIgeTI9IjExMiIgc3Ryb2tlPSIjRTVFN0VCIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIyNCIgeT0iMTMwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAPC90ZXh0PgogIAogICAgICAgIDx0ZXh0IHg9IjI0IiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiPuOCt+ODs+OCsOODq+ODq+ODvOODoCAx5rOKPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjMwMCIgeT0iMTc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj4xMCw5MDnDlzE8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlMTAsOTA5PC90ZXh0PgogICAgICAgIAogICAgICAgIDx0ZXh0IHg9IjI0IiB5PSIxOTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiPuacnemjn+ODk+ODpeODg+ODleOCpzwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzMDAiIHk9IjE5OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9ImVuZCI+MSwwOTHDlzE8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxOTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlMSwwOTE8L3RleHQ+CiAgICAgICAgCiAgPGxpbmUgeDE9IjE2IiB5MT0iMjIwIiB4Mj0iMzg0IiB5Mj0iMjIwIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtZGFzaGFycmF5PSI0LDMiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjI0MiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPua2iOiyu+eoju+8iDEwJe+8iei+vOOBvzwvdGV4dD4KICA8cmVjdCB4PSIxNiIgeT0iMjUyIiB3aWR0aD0iMzY4IiBoZWlnaHQ9IjUyIiByeD0iOCIgZmlsbD0iIzdDM0FFRCIgb3BhY2l0eT0iMC4wOCIvPgogIDx0ZXh0IHg9IjYwIiB5PSIyODUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjN0MzQUVEIiBmb250LXdlaWdodD0iYm9sZCI+5ZCIIOioiDwvdGV4dD4KICA8dGV4dCB4PSIzNzUiIHk9IjI4NSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIyMiIgZmlsbD0iIzdDM0FFRCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJlbmQiPsKlMTIsMDAwPC90ZXh0PgogIDx0ZXh0IHg9IjM3NSIgeT0iMjk4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmaWxsPSIjOUNBM0FGIiB0ZXh0LWFuY2hvcj0iZW5kIj7jgYbjgaHmtojosrvnqI4gwqUxLDA5MDwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjMyNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iI0QxRDVEQiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5LiK6KiY44Gu6YCa44KK6aCY5Y+O44GE44Gf44GX44G+44GX44GfPC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMzQwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmaWxsPSIjRDFENURCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jg5vjg4bjg6vjgrDjg6njg7Pjg7TjgqPjgqLlpKfpmKo8L3RleHQ+Cjwvc3ZnPg==',
  receipt_komeda:    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzc4IiB2aWV3Qm94PSIwIDAgNDAwIDM3OCI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzNzgiIGZpbGw9IndoaXRlIi8+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MiIgZmlsbD0iI0Q5NzcwNiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEzIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiPumgmCDlj44g5pu4PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iNDEiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODUpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7jgrPjg6Hjg4Dnj4jnkLLlupcg5aSn5omL55S65bqXPC90ZXh0PgogIDxsaW5lIHgxPSIxNiIgeTE9IjYwIiB4Mj0iMzg0IiB5Mj0iNjAiIHN0cm9rZT0iI0U1RTdFQiIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iMjQiIHk9Ijc4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+5Y+X6aCYTm8uPC90ZXh0PgogIDx0ZXh0IHg9IjExMCIgeT0iNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzNzQxNTEiPktNLTA2MjAtMDA5MzwvdGV4dD4KICA8dGV4dCB4PSIyODAiIHk9Ijc4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+55m66KGM5pelPC90ZXh0PgogIDx0ZXh0IHg9IjM4NSIgeT0iNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzNzQxNTEiIHRleHQtYW5jaG9yPSJlbmQiPjIwMjYtMDYtMjA8L3RleHQ+CiAgPGxpbmUgeDE9IjE2IiB5MT0iODgiIHgyPSIzODQiIHkyPSI4OCIgc3Ryb2tlPSIjRjNGNEY2IiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSIyNCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCI+5ZOB55uuPC90ZXh0PgogIDx0ZXh0IHg9IjMwMCIgeT0iMTA1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9ImVuZCI+5pWw6YePw5fljZjkvqE8L3RleHQ+CiAgPHRleHQgeD0iMzgwIiB5PSIxMDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0iZW5kIj7lsI/oqIg8L3RleHQ+CiAgPGxpbmUgeDE9IjE2IiB5MT0iMTEyIiB4Mj0iMzg0IiB5Mj0iMTEyIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMSIvPgogIDx0ZXh0IHg9IjI0IiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkI3MjgwIj7ilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIA8L3RleHQ+CiAgCiAgICAgICAgPHRleHQgeD0iMjQiIHk9IjE3OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSI+44Kz44O844OS44O877yI44OW44Os44Oz44OJ77yJPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjMwMCIgeT0iMTc4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj42NjDDlzM8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxNzgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlMSw5ODA8L3RleHQ+CiAgICAgICAgCiAgICAgICAgPHRleHQgeD0iMjQiIHk9IjE5OCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSI+44K344Ot44OO44Ov44O844OrPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjMwMCIgeT0iMTk4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0iZW5kIj43ODDDlzE8L3RleHQ+CiAgICAgICAgPHRleHQgeD0iMzgwIiB5PSIxOTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMxMTE4MjciIHRleHQtYW5jaG9yPSJlbmQiPsKlNzgwPC90ZXh0PgogICAgICAgIAogICAgICAgIDx0ZXh0IHg9IjI0IiB5PSIyMTgiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIGZpbGw9IiMzNzQxNTEiPuODouODvOODi+ODs+OCsOOCu+ODg+ODiDwvdGV4dD4KICAgICAgICA8dGV4dCB4PSIzMDAiIHk9IjIxOCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9ImVuZCI+NTgww5cxPC90ZXh0PgogICAgICAgIDx0ZXh0IHg9IjM4MCIgeT0iMjE4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjExIiBmaWxsPSIjMTExODI3IiB0ZXh0LWFuY2hvcj0iZW5kIj7CpTU4MDwvdGV4dD4KICAgICAgICAKICA8bGluZSB4MT0iMTYiIHkxPSIyNDAiIHgyPSIzODQiIHkyPSIyNDAiIHN0cm9rZT0iI0QxRDVEQiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjQsMyIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjYyIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMSIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5raI6LK756iO77yIMTAl77yJ6L6844G/PC90ZXh0PgogIDxyZWN0IHg9IjE2IiB5PSIyNzIiIHdpZHRoPSIzNjgiIGhlaWdodD0iNTIiIHJ4PSI4IiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIwLjA4Ii8+CiAgPHRleHQgeD0iNjAiIHk9IjMwNSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNEOTc3MDYiIGZvbnQtd2VpZ2h0PSJib2xkIj7lkIgg6KiIPC90ZXh0PgogIDx0ZXh0IHg9IjM3NSIgeT0iMzA1IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjIyIiBmaWxsPSIjRDk3NzA2IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9ImVuZCI+wqUzLDgwMDwvdGV4dD4KICA8dGV4dCB4PSIzNzUiIHk9IjMxOCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9ImVuZCI+44GG44Gh5raI6LK756iOIMKlMzQ1PC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iMzQ2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI5IiBmaWxsPSIjRDFENURCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIroqJjjga7pgJrjgorpoJjlj47jgYTjgZ/jgZfjgb7jgZfjgZ88L3RleHQ+CiAgPHRleHQgeD0iMjAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjkiIGZpbGw9IiNEMUQ1REIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuOCs+ODoeeQsuWumuaXpSDoqIjliLblupc8L3RleHQ+Cjwvc3ZnPg==',
};

// ── Dummy data ───────────────────────────────────────────────────────────────
const DUMMY = [
  // ── settled (past months) ──
  {
    id: 1, submitterId: 'tanaka', date: '2026-06-02', submitDate: '2026-06-03',
    category: '交通費', payee: 'JR東日本', amount: 3200,
    memo: '大阪出張 往復', extra: { route: '東京→大阪（新幹線）' },
    status: 'settled', receiptData: RECEIPT_IMGS.receipt_jr, receiptName: '領収書_JR_20260602.svg',
    settledDate: '2026-06-25',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-06-03T10:20:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-04T11:05:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-05T09:30:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-06-25T10:00:00', note: '6月末振込済み' },
    ],
  },
  {
    id: 2, submitterId: 'tanaka', date: '2026-06-05', submitDate: '2026-06-05',
    category: '会議費', payee: 'スターバックス', amount: 2400,
    memo: '取引先との打ち合わせ費用', extra: { attendees: '田中、得意先 佐野様', purpose: 'Q2受注折衝' },
    status: 'settled', receiptData: RECEIPT_IMGS.receipt_starbucks, receiptName: '領収書_Starbucks_20260605.svg',
    settledDate: '2026-06-25',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-06-05T18:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-06T09:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-07T10:00:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-06-25T10:00:00', note: '' },
    ],
  },
  {
    id: 3, submitterId: 'suzuki', date: '2026-06-18', submitDate: '2026-06-18',
    category: '会議費', payee: '椿屋珈琲', amount: 1800,
    memo: '社内勉強会 お茶代', extra: { attendees: '開発チーム 6名', purpose: 'セキュリティ勉強会' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-06-25',
    history: [
      { action: 'submitted',       who: '鈴木 次郎', at: '2026-06-18T17:30:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-19T10:20:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-20T09:45:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-06-25T10:00:00', note: '' },
    ],
  },
  {
    id: 4, submitterId: 'tanaka', date: '2026-05-10', submitDate: '2026-05-11',
    category: '交通費', payee: 'JR東日本', amount: 5600,
    memo: '福岡出張 往復', extra: { route: '東京→福岡（新幹線）' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-05-31',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-05-11T08:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-05-12T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-05-13T09:00:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-05-31T10:00:00', note: '' },
    ],
  },
  {
    id: 5, submitterId: 'sato', date: '2026-05-18', submitDate: '2026-05-19',
    category: '接待費', payee: '六本木 △△', amount: 35000,
    memo: 'B社接待', extra: { client: '株式会社Bソリューションズ 渡辺部長', attendees: '5名（社内2名、先方3名）' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-05-31',
    history: [
      { action: 'submitted',       who: '佐藤 花子', at: '2026-05-19T09:30:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-05-20T11:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-05-21T10:30:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-05-31T10:00:00', note: '' },
    ],
  },
  {
    id: 6, submitterId: 'tanaka', date: '2026-04-05', submitDate: '2026-04-06',
    category: '宿泊費', payee: 'ホテルニッコー京都', amount: 18000,
    memo: '京都出張 1泊', extra: { destination: '京都', nights: '1泊' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-04-30',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-04-06T09:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-04-07T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-04-08T09:30:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-04-30T10:00:00', note: '' },
    ],
  },
  {
    id: 7, submitterId: 'suzuki', date: '2026-04-22', submitDate: '2026-04-22',
    category: '消耗品費', payee: 'ヨドバシカメラ', amount: 9800,
    memo: 'Webカメラ購入（テレワーク用）', extra: {},
    status: 'settled', receiptMock: true,
    settledDate: '2026-04-30',
    history: [
      { action: 'submitted',       who: '鈴木 次郎', at: '2026-04-22T14:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-04-23T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-04-24T09:00:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-04-30T10:00:00', note: '' },
    ],
  },
  {
    id: 8, submitterId: 'tanaka', date: '2026-03-15', submitDate: '2026-03-16',
    category: '会議費', payee: '会議室レンタル', amount: 22000,
    memo: '四半期レビュー 会場費', extra: { attendees: '全社員 22名', purpose: '2026年Q1事業レビュー' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-03-31',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-03-16T09:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-03-17T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-03-18T09:30:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-03-31T10:00:00', note: '' },
    ],
  },
  {
    id: 9, submitterId: 'sato', date: '2026-02-08', submitDate: '2026-02-09',
    category: '交通費', payee: '東海道新幹線', amount: 27280,
    memo: '大阪・名古屋 出張 往復', extra: { route: '東京→大阪→名古屋→東京' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-02-28',
    history: [
      { action: 'submitted',       who: '佐藤 花子', at: '2026-02-09T10:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-02-10T10:30:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-02-11T09:00:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-02-28T10:00:00', note: '' },
    ],
  },
  {
    id: 10, submitterId: 'tanaka', date: '2026-01-20', submitDate: '2026-01-21',
    category: '接待費', payee: '丸の内 ◇◇', amount: 42000,
    memo: 'C社新年会接待', extra: { client: 'C株式会社 鈴木社長 他2名', attendees: '6名（社内3名、先方3名）' },
    status: 'settled', receiptMock: true,
    settledDate: '2026-01-31',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-01-21T09:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-01-22T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-01-23T09:30:00', note: '' },
      { action: 'settled',          who: '中村 さき', at: '2026-01-31T10:00:00', note: '' },
    ],
  },
  // ── finance_processing (承認済み・処理中) ──
  {
    id: 11, submitterId: 'tanaka', date: '2026-06-08', submitDate: '2026-06-09',
    category: '宿泊費', payee: 'ホテルグランヴィア大阪', amount: 12000,
    memo: '大阪出張 1泊', extra: { destination: '大阪', nights: '1泊' },
    status: 'finance_processing', receiptData: RECEIPT_IMGS.receipt_hotel, receiptName: '領収書_ホテルグランヴィア_20260609.svg',
    settledDate: '2026-07-25',
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-06-09T10:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-10T09:30:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-12T10:00:00', note: '' },
    ],
  },
  // ── finance_pending (経理処理待ち) ──
  {
    id: 12, submitterId: 'sato', date: '2026-06-16', submitDate: '2026-06-17',
    category: '交通費', payee: '東海道新幹線', amount: 13640,
    memo: '名古屋出張 往復', extra: { route: '東京→名古屋（新幹線）' },
    status: 'finance_pending', receiptMock: true,
    settledDate: '2026-07-25',
    history: [
      { action: 'submitted',       who: '佐藤 花子', at: '2026-06-17T09:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-18T10:30:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-20T09:00:00', note: '' },
    ],
  },
  {
    id: 13, submitterId: 'suzuki', date: '2026-06-13', submitDate: '2026-06-13',
    category: '消耗品費', payee: 'Amazon', amount: 4800,
    memo: 'オフィス用コピー用紙（A4 500枚×5冊）', extra: {},
    status: 'finance_pending', receiptMock: true,
    settledDate: '2026-07-25',
    history: [
      { action: 'submitted',       who: '鈴木 次郎', at: '2026-06-13T12:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-14T10:00:00', note: '' },
      { action: 'finance_approved', who: '中村 さき', at: '2026-06-16T09:30:00', note: '' },
    ],
  },
  // ── manager_approved (上長承認済み・経理待ち) ──
  {
    id: 14, submitterId: 'tanaka', date: '2026-06-20', submitDate: '2026-06-20',
    category: '会議費', payee: 'コメダ珈琲', amount: 3800,
    memo: '新規顧客との初回ミーティング', extra: { attendees: '田中、新規顧客 松本様 2名', purpose: '新規受注可能性ヒアリング' },
    status: 'manager_approved', receiptData: RECEIPT_IMGS.receipt_komeda, receiptName: '領収書_コメダ珈琲_20260620.svg',
    settledDate: null,
    history: [
      { action: 'submitted',       who: '田中 太郎', at: '2026-06-20T19:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-21T11:00:00', note: '' },
    ],
  },
  {
    id: 15, submitterId: 'sato', date: '2026-06-22', submitDate: '2026-06-23',
    category: '宿泊費', payee: 'ANAクラウンプラザホテル福岡', amount: 15000,
    memo: '福岡出張 1泊', extra: { destination: '福岡', nights: '1泊' },
    status: 'manager_approved', receiptMock: true,
    settledDate: null,
    history: [
      { action: 'submitted',       who: '佐藤 花子', at: '2026-06-23T10:00:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-24T09:30:00', note: '' },
    ],
  },
  // ── pending (上長承認待ち) ──
  {
    id: 16, submitterId: 'sato', date: '2026-06-10', submitDate: '2026-06-10',
    category: '接待費', payee: '銀座 ○○', amount: 28000,
    memo: 'A社担当者との関係構築', extra: { client: 'A株式会社 営業部 3名', attendees: '5名（社内2名、先方3名）' },
    status: 'pending', receiptMock: true,
    settledDate: null,
    history: [
      { action: 'submitted', who: '佐藤 花子', at: '2026-06-10T22:00:00', note: '' },
    ],
  },
  {
    id: 17, submitterId: 'tanaka', date: '2026-06-11', submitDate: '2026-06-11',
    category: '交通費', payee: '東京メトロ', amount: 540,
    memo: '訪問営業 往復', extra: { route: '渋谷→新宿（往復）' },
    status: 'pending', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted', who: '田中 太郎', at: '2026-06-11T18:30:00', note: '' },
    ],
  },
  {
    id: 18, submitterId: 'tanaka', date: '2026-06-24', submitDate: '2026-06-24',
    category: '交通費', payee: 'タクシー（深夜）', amount: 3200,
    memo: '深夜残業後の帰宅タクシー', extra: { route: 'オフィス→自宅（深夜22時以降）' },
    status: 'pending', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted', who: '田中 太郎', at: '2026-06-24T23:10:00', note: '' },
    ],
  },
  {
    id: 19, submitterId: 'suzuki', date: '2026-06-24', submitDate: '2026-06-24',
    category: '通信費', payee: 'ソフトバンク', amount: 6600,
    memo: '6月分 業務用携帯電話料金', extra: {},
    status: 'pending', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted', who: '鈴木 次郎', at: '2026-06-24T09:00:00', note: '' },
    ],
  },
  {
    id: 20, submitterId: 'tanaka', date: '2026-06-25', submitDate: '2026-06-25',
    category: 'その他', payee: '〇〇書店', amount: 3200,
    memo: 'PM研修テキスト 2冊', extra: {},
    status: 'pending', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted', who: '田中 太郎', at: '2026-06-25T12:00:00', note: '' },
    ],
  },
  // ── rejected (1件目: 上長による差し戻し) ──
  {
    id: 21, submitterId: 'tanaka', date: '2026-06-14', submitDate: '2026-06-14',
    category: '通信費', payee: 'ソフトバンク', amount: 6600,
    memo: '6月分 携帯電話費用', extra: {},
    status: 'rejected', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted', who: '田中 太郎', at: '2026-06-14T10:00:00', note: '' },
      { action: 'rejected',  who: '山田 健一', at: '2026-06-15T09:00:00', note: '領収書の添付が必要です。再申請時は必ずPDFを添付してください。' },
    ],
  },
  // ── 差し戻し→再申請シナリオ ──
  // 22: 経理で差し戻された元申請（佐藤）
  {
    id: 22, submitterId: 'sato', date: '2026-06-10', submitDate: '2026-06-11',
    category: '接待費', payee: '赤坂 ××', amount: 48000,
    memo: 'D社担当者との関係強化（接待）', extra: { client: 'D株式会社 営業部長 村上様', attendees: '5名（社内2名、先方3名）' },
    status: 'rejected', receiptMock: false,
    settledDate: null,
    history: [
      { action: 'submitted',        who: '佐藤 花子', at: '2026-06-11T09:30:00', note: '' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-12T10:15:00', note: '' },
      { action: 'rejected',         who: '中村 さき', at: '2026-06-13T11:40:00', note: '領収書の合計金額（¥45,000）と申請額（¥48,000）が一致していません。差額¥3,000の内訳を確認し、正しい金額で再申請してください。' },
    ],
  },
  // 23: 再申請版（修正して領収書を添付し再提出）
  {
    id: 23, submitterId: 'sato', date: '2026-06-10', submitDate: '2026-06-14',
    category: '接待費', payee: '赤坂 ××', amount: 45000,
    memo: '【再申請】D社担当者との関係強化（接待）※6/13差し戻し分', extra: { client: 'D株式会社 営業部長 村上様', attendees: '5名（社内2名、先方3名）' },
    status: 'manager_approved', receiptMock: true,
    settledDate: null,
    history: [
      { action: 'submitted',        who: '佐藤 花子', at: '2026-06-14T14:20:00', note: '金額を修正しました（¥48,000→¥45,000）。領収書を添付しています。' },
      { action: 'manager_approved', who: '山田 健一', at: '2026-06-15T09:30:00', note: '再確認済み。経理へ回します。' },
    ],
  },
];

// ── State ────────────────────────────────────────────────────────────────────
const DATA_VERSION = '7';  // increment when DUMMY data structure changes
if (localStorage.getItem('ef_data_version') !== DATA_VERSION) {
  localStorage.removeItem('ef_expenses');
  localStorage.setItem('ef_data_version', DATA_VERSION);
}
let expenses = JSON.parse(localStorage.getItem('ef_expenses') || 'null') || DUMMY;
let nextId   = Math.max(...expenses.map(e => e.id)) + 1;
let currentUserId = localStorage.getItem('ef_user') || 'tanaka';
let currentView   = 'dashboard';
let currentMonth  = new Date(2026, 5, 1);

function save() { localStorage.setItem('ef_expenses', JSON.stringify(expenses)); }
function saveUser(id) { localStorage.setItem('ef_user', id); }

const me = () => USERS[currentUserId];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => '¥' + Number(n).toLocaleString('ja-JP');

function statusBadge(s) {
  return `<span class="status-badge status-${s}">${STATUS_LABEL[s] || s}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('T')[0].split('-');
  return `${y}/${m}/${day}`;
}

function formatDateTime(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}

function submitterName(e) {
  return USERS[e.submitterId]?.name || e.submitterId;
}

function monthKey(dateStr) {
  const [y, m] = dateStr.split('-');
  return `${y}-${m}`;
}

// ── Demo user switcher ────────────────────────────────────────────────────────
function renderDemoSwitcher() {
  const container = document.getElementById('demoUsers');
  container.innerHTML = Object.values(USERS).map(u => `
    <button class="demo-user-btn ${u.id === currentUserId ? 'active' : ''}" onclick="switchUser('${u.id}')">
      <div class="demo-avatar-sm" style="background:${u.color}">${u.initial}</div>
      <div class="demo-user-info">
        <span class="demo-user-name">${u.name}</span>
        <span class="demo-user-role">${u.title}</span>
      </div>
    </button>
  `).join('');

  const u = me();
  document.getElementById('sidebarAvatar').textContent = u.initial;
  document.getElementById('sidebarAvatar').style.background = u.color;
  document.getElementById('sidebarName').textContent = u.name;
  document.getElementById('sidebarRole').textContent = `${u.title} · ${u.dept}`;
}

function switchUser(id) {
  currentUserId = id;
  saveUser(id);
  renderDemoSwitcher();
  updateNavVisibility();
  updateBadge();
  renderView(currentView);
}

function updateNavVisibility() {
  const role = me().role;
  // Submit: only employees
  document.getElementById('navSubmit').classList.toggle('hidden', role !== 'employee');
  // Approval: manager and finance
  document.getElementById('navApproval').classList.toggle('hidden', role === 'employee');
  // If current view is inaccessible, go to dashboard
  if (role !== 'employee' && currentView === 'submit') switchView('dashboard');
  if (role === 'employee' && currentView === 'approval') switchView('dashboard');
}

// ── Navigation ───────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
  renderView(view);
}

function renderView(view) {
  if (view === 'dashboard') renderDashboard();
  if (view === 'approval')  renderApproval();
  if (view === 'history')   renderHistory();
  updateBadge();
}

// ── Dashboard ────────────────────────────────────────────────────────────────
let categoryChart, trendChart;

function renderDashboard() {
  const role = me().role;
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();

  const allMonth = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });

  const myMonth = role === 'employee'
    ? allMonth.filter(e => e.submitterId === currentUserId)
    : allMonth;

  // Finance gets a completely different dashboard
  if (role === 'finance') {
    renderFinanceDashboard(y, m, allMonth);
    return;
  }

  document.getElementById('dashTitle').textContent =
    role === 'employee' ? 'マイダッシュボード' : '承認ダッシュボード';
  document.getElementById('dashCsvExport').classList.add('hidden');
  document.getElementById('financeQueue').classList.add('hidden');
  document.getElementById('statsGrid').classList.remove('hidden');
  document.getElementById('chartsGrid').classList.remove('hidden');
  document.getElementById('recentCard').classList.remove('hidden');

  // ── Action alerts (manager only here; finance handled separately above) ──
  const alerts = document.getElementById('actionAlerts');
  if (role === 'manager') {
    const needAction = expenses.filter(e => e.status === 'pending');
    const rejected   = expenses.filter(e => e.status === 'rejected');
    const unproc     = needAction.reduce((s, e) => s + e.amount, 0);
    alerts.classList.remove('hidden');
    alerts.innerHTML = `
      <div class="action-card urgent">
        <div class="action-card-label">今日の対応が必要</div>
        <div class="action-card-value">${needAction.length}件</div>
        <div class="action-card-sub">上長承認待ち</div>
      </div>
      <div class="action-card warn">
        <div class="action-card-label">未承認合計金額</div>
        <div class="action-card-value">${fmt(unproc)}</div>
        <div class="action-card-sub">${needAction.length}件の申請</div>
      </div>
      <div class="action-card">
        <div class="action-card-label">差し戻し中</div>
        <div class="action-card-value">${rejected.length}件</div>
        <div class="action-card-sub">再申請待ち</div>
      </div>
      <div class="action-card ok">
        <div class="action-card-label">今月の承認完了</div>
        <div class="action-card-value">${allMonth.filter(e=>['manager_approved','finance_pending','finance_processing','settled'].includes(e.status)).length}件</div>
        <div class="action-card-sub">${fmt(allMonth.filter(e=>['manager_approved','finance_pending','finance_processing','settled'].includes(e.status)).reduce((s,e)=>s+e.amount,0))}</div>
      </div>
    `;
  } else {
    alerts.classList.add('hidden');
  }

  // ── Stats ──
  const statsGrid = document.getElementById('statsGrid');
  if (role === 'employee') {
    const myAll = expenses.filter(e => e.submitterId === currentUserId);
    const myPending  = myAll.filter(e => ['pending','manager_approved'].includes(e.status));
    const myApproved = myAll.filter(e => ['finance_pending','finance_processing','settled'].includes(e.status));
    const myRejected = myAll.filter(e => e.status === 'rejected');
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">今月の申請合計</div>
        <div class="stat-value">${fmt(myMonth.reduce((s,e)=>s+e.amount,0))}</div>
        <div class="stat-sub">${myMonth.length}件</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-label">承認待ち</div>
        <div class="stat-value">${myPending.length}件</div>
        <div class="stat-sub">${fmt(myPending.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
      <div class="stat-card approved">
        <div class="stat-label">承認済み（累計）</div>
        <div class="stat-value">${myApproved.length}件</div>
        <div class="stat-sub">${fmt(myApproved.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-label">差し戻し</div>
        <div class="stat-value">${myRejected.length}件</div>
        <div class="stat-sub">要対応</div>
      </div>
    `;
  } else {
    // manager
    const pending  = allMonth.filter(e => e.status === 'pending');
    const approved = allMonth.filter(e => ['manager_approved','finance_pending','finance_processing','settled'].includes(e.status));
    const settled  = allMonth.filter(e => e.status === 'settled');
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">今月の申請合計</div>
        <div class="stat-value">${fmt(allMonth.reduce((s,e)=>s+e.amount,0))}</div>
        <div class="stat-sub">${allMonth.length}件</div>
      </div>
      <div class="stat-card pending">
        <div class="stat-label">上長承認待ち</div>
        <div class="stat-value">${pending.length}件</div>
        <div class="stat-sub">${fmt(pending.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
      <div class="stat-card approved">
        <div class="stat-label">承認済み</div>
        <div class="stat-value">${approved.length}件</div>
        <div class="stat-sub">${fmt(approved.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
      <div class="stat-card finance">
        <div class="stat-label">精算済み</div>
        <div class="stat-value">${settled.length}件</div>
        <div class="stat-sub">${fmt(settled.reduce((s,e)=>s+e.amount,0))}</div>
      </div>
    `;
  }
  document.getElementById('recentSubtitle').textContent =
    role === 'employee' ? '自分の申請' : '全員の申請';

  // ── Category chart ──
  const chartData = role === 'employee' ? myMonth : allMonth;
  const cats = {};
  chartData.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
  const COLORS = ['#4F46E5','#7C3AED','#0284C7','#059669','#D97706','#DC2626','#6B7280'];
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(cats),
      datasets: [{ data: Object.values(cats), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      plugins: {
        legend: { position: 'right', labels: { font: { size: 11 }, padding: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
      },
      cutout: '60%',
    },
  });

  // ── Trend chart ──
  const trendLabels = [], trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    trendLabels.push(`${d.getMonth()+1}月`);
    const src = role === 'employee'
      ? expenses.filter(e => e.submitterId === currentUserId)
      : expenses;
    trendData.push(src.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    }).reduce((s, e) => s + e.amount, 0));
  }
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'bar',
    data: {
      labels: trendLabels,
      datasets: [{ label: '経費合計', data: trendData,
        backgroundColor: 'rgba(79,70,229,.15)', borderColor: '#4F46E5',
        borderWidth: 2, borderRadius: 6 }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => '¥' + v.toLocaleString() }, grid: { color: '#F3F4F6' } },
        x: { grid: { display: false } },
      },
    },
  });

  // ── Recent table ──
  const recent = (role === 'employee'
    ? expenses.filter(e => e.submitterId === currentUserId)
    : expenses
  ).sort((a, b) => b.submitDate.localeCompare(a.submitDate)).slice(0, 8);

  document.getElementById('recentTableBody').innerHTML = recent.length
    ? recent.map(e => {
        const approver = currentApproverText(e);
        return `
          <tr onclick="openDetail(${e.id})">
            <td>${formatDate(e.submitDate)}</td>
            <td><span style="font-weight:600">${submitterName(e)}</span></td>
            <td>${e.memo}</td>
            <td><span style="font-size:11px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
            <td class="amount">${fmt(e.amount)}</td>
            <td>
              ${statusBadge(e.status)}
              ${approver ? `<div style="margin-top:4px"><span class="approver-tag">→ ${approver}</span></div>` : ''}
            </td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--gray-400)">この月の申請はありません</td></tr>';
}

// ── Finance Dashboard (専用) ──────────────────────────────────────────────────
function renderFinanceDashboard(y, m, allMonth) {
  document.getElementById('dashTitle').textContent = '経理ダッシュボード';
  document.getElementById('dashCsvExport').classList.remove('hidden');
  document.getElementById('statsGrid').classList.add('hidden');
  document.getElementById('financeQueue').classList.remove('hidden');
  document.getElementById('recentCard').classList.remove('hidden');

  // 5 summary cards
  const waitFinance  = expenses.filter(e => e.status === 'manager_approved');
  const finApproved  = expenses.filter(e => e.status === 'finance_pending');
  const processing   = expenses.filter(e => e.status === 'finance_processing');
  const rejectedAll  = expenses.filter(e => e.status === 'rejected');
  const settledMonth = allMonth.filter(e => e.status === 'settled');
  const scheduledAmt = finApproved.reduce((s,e)=>s+e.amount,0) + processing.reduce((s,e)=>s+e.amount,0);

  // 「今日の対応」= 3日以上滞留している未処理案件（期限超過）
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const overdueItems = [...waitFinance, ...finApproved, ...processing].filter(e => {
    const lastAction = e.history.at(-1);
    return lastAction && new Date(lastAction.at).getTime() < threeDaysAgo;
  });

  const alerts = document.getElementById('actionAlerts');
  alerts.classList.remove('hidden');
  alerts.className = 'action-alerts five-col';
  alerts.innerHTML = `
    <div class="action-card urgent">
      <div class="action-card-label">経理確認待ち</div>
      <div class="action-card-value">${waitFinance.length}件</div>
      <div class="action-card-sub">${fmt(waitFinance.reduce((s,e)=>s+e.amount,0))}</div>
    </div>
    <div class="action-card warn">
      <div class="action-card-label">今日の対応<span class="action-card-badge-hint">期限超過</span></div>
      <div class="action-card-value">${overdueItems.length}件</div>
      <div class="action-card-sub">3日以上滞留中</div>
    </div>
    <div class="action-card">
      <div class="action-card-label">差し戻し中</div>
      <div class="action-card-value">${rejectedAll.length}件</div>
      <div class="action-card-sub">再申請待ち</div>
    </div>
    <div class="action-card" style="border-top-color:var(--purple)">
      <div class="action-card-label">今月精算予定</div>
      <div class="action-card-value" style="font-size:19px">${fmt(scheduledAmt)}</div>
      <div class="action-card-sub">${finApproved.length + processing.length}件</div>
    </div>
    <div class="action-card ok">
      <div class="action-card-label">今月処理済み</div>
      <div class="action-card-value">${settledMonth.length}件</div>
      <div class="action-card-sub">${fmt(settledMonth.reduce((s,e)=>s+e.amount,0))}</div>
    </div>
  `;

  // 処理キュー (今やるべき申請リスト)
  const queue = [
    ...expenses.filter(e => e.status === 'manager_approved'),
    ...expenses.filter(e => e.status === 'finance_pending'),
    ...expenses.filter(e => e.status === 'finance_processing'),
  ];

  const queueHtml = queue.length ? `
    <div class="fq-section">
      <div class="fq-section-label urgent-label">
        <span class="fq-dot urgent"></span> 今対応が必要な申請
        <span class="fq-count">${queue.length}件</span>
      </div>
      <table class="expense-table">
        <thead>
          <tr>
            <th>申請日</th>
            <th>申請者</th>
            <th>内容</th>
            <th>カテゴリ</th>
            <th>金額</th>
            <th>領収書</th>
            <th>ステータス</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          ${queue.map(e => {
            const receipt = e.receiptData
              ? `<img src="${e.receiptData}" class="tbl-receipt-thumb" onclick="event.stopPropagation();window.open('${e.receiptData}')">`
              : e.receiptMock
                ? `<span class="tbl-receipt-ok">📄 あり</span>`
                : `<span class="tbl-receipt-none">なし</span>`;

            let actionBtn = '';
            if (e.status === 'manager_approved') {
              actionBtn = `
                <button class="btn-success fq-btn" onclick="event.stopPropagation();fqApprove(${e.id})">経理承認</button>
                <button class="btn-danger fq-btn"  onclick="event.stopPropagation();openRejectModal(${e.id})">差戻し</button>`;
            } else if (e.status === 'finance_pending') {
              actionBtn = `<button class="btn-warn fq-btn" onclick="event.stopPropagation();fqProcess(${e.id})">精算処理へ</button>`;
            } else if (e.status === 'finance_processing') {
              actionBtn = `<button class="btn-success fq-btn" onclick="event.stopPropagation();fqSettle(${e.id})">精算済みに</button>`;
            }

            return `
              <tr onclick="openDetail(${e.id})">
                <td>${formatDate(e.submitDate)}</td>
                <td style="font-weight:600">${submitterName(e)}</td>
                <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.memo}</td>
                <td><span style="font-size:11px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
                <td class="amount">${fmt(e.amount)}</td>
                <td>${receipt}</td>
                <td>${statusBadge(e.status)}</td>
                <td onclick="event.stopPropagation()" style="white-space:nowrap">${actionBtn}
                  <button class="btn-sm fq-btn" onclick="event.stopPropagation();openDetail(${e.id})">詳細</button>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  ` : `
    <div class="fq-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
      <p>対応が必要な申請はありません</p>
    </div>
  `;

  document.getElementById('financeQueue').innerHTML = `
    <div class="finance-queue-card">
      ${queueHtml}
    </div>
  `;

  // 最近の精算済み
  document.getElementById('recentTitle').textContent = '最近の精算済み';
  document.getElementById('recentSubtitle').textContent = '今月';
  document.getElementById('recentTableHead').innerHTML = `
    <tr>
      <th>申請日</th><th>申請者</th><th>内容</th><th>カテゴリ</th><th>金額</th><th>精算日</th>
    </tr>`;

  const recentSettled = expenses
    .filter(e => e.status === 'settled')
    .sort((a,b) => b.submitDate.localeCompare(a.submitDate))
    .slice(0, 6);

  document.getElementById('recentTableBody').innerHTML = recentSettled.length
    ? recentSettled.map(e => {
        const settledEntry = e.history.find(h => h.action === 'settled');
        return `
          <tr onclick="openDetail(${e.id})">
            <td>${formatDate(e.submitDate)}</td>
            <td style="font-weight:600">${submitterName(e)}</td>
            <td>${e.memo}</td>
            <td><span style="font-size:11px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
            <td class="amount">${fmt(e.amount)}</td>
            <td style="color:var(--success);font-weight:600">${e.settledDate || formatDate(settledEntry?.at) || '—'}</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--gray-400)">精算済み案件はありません</td></tr>';

  // Charts at bottom for finance
  document.getElementById('chartsGrid').classList.remove('hidden');
  const cats = {};
  allMonth.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
  const COLORS = ['#4F46E5','#7C3AED','#0284C7','#059669','#D97706','#DC2626','#6B7280'];
  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }] },
    options: { plugins: { legend: { position: 'right', labels: { font:{size:11}, padding:10 } }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } } }, cutout: '60%' },
  });
  const trendLabels = [], trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    trendLabels.push(`${d.getMonth()+1}月`);
    trendData.push(expenses.filter(e => { const ed = new Date(e.date); return ed.getFullYear()===d.getFullYear()&&ed.getMonth()===d.getMonth(); }).reduce((s,e)=>s+e.amount,0));
  }
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'bar',
    data: { labels: trendLabels, datasets: [{ label:'経費合計', data: trendData, backgroundColor:'rgba(79,70,229,.15)', borderColor:'#4F46E5', borderWidth:2, borderRadius:6 }] },
    options: { plugins:{legend:{display:false}}, scales:{ y:{ticks:{callback:v=>'¥'+v.toLocaleString()},grid:{color:'#F3F4F6'}}, x:{grid:{display:false}} } },
  });
}

// Finance queue inline actions (dashboard)
function fqApprove(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  e.status = 'finance_pending';
  e.history.push({ action: 'finance_approved', who: me().name, at: new Date().toISOString(), note: '' });
  e.settledDate = '2026-07-25';
  save(); renderDashboard(); updateBadge();
  showToast('経理承認しました ✓', 'success');
}
function fqProcess(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  e.status = 'finance_processing';
  e.history.push({ action: 'processing', who: me().name, at: new Date().toISOString(), note: '精算処理開始' });
  save(); renderDashboard(); updateBadge();
  showToast('精算処理へ移行しました ✓', 'success');
}
function fqSettle(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  e.status = 'settled';
  e.settledDate = new Date().toISOString().slice(0,10);
  e.history.push({ action: 'settled', who: me().name, at: new Date().toISOString(), note: '振込完了' });
  save(); renderDashboard(); updateBadge();
  showToast('精算済みにしました ✓', 'success');
}

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  updateMonthLabel(); renderDashboard();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  updateMonthLabel(); renderDashboard();
});
function updateMonthLabel() {
  document.getElementById('currentMonthLabel').textContent =
    `${currentMonth.getFullYear()}年 ${currentMonth.getMonth()+1}月`;
}

// ── Submit Form ───────────────────────────────────────────────────────────────
document.getElementById('expDate').valueAsDate = new Date('2026-06-26');

// Category extra fields
document.getElementById('expCategory').addEventListener('change', function () {
  const extra = CATEGORY_EXTRA[this.value];
  const container = document.getElementById('extraFieldsContainer');
  const fields    = document.getElementById('extraFields');

  if (!extra) {
    container.classList.add('hidden');
    fields.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');
  fields.innerHTML = `
    <div class="extra-fields-box">
      <div class="extra-fields-title">📋 ${this.value}の必須入力項目</div>
      <div class="extra-fields-grid">
        ${extra.map(f => `
          <div class="form-group">
            <label for="ef_${f.id}">${f.label} ${f.required ? '<span class="required">*</span>' : ''}</label>
            <input type="text" id="ef_${f.id}" placeholder="${f.placeholder}" ${f.required ? 'required' : ''} />
          </div>
        `).join('')}
      </div>
    </div>
  `;
});

let attachedFile = null;
let attachedDataUrl = null;

document.getElementById('expFile').addEventListener('change', function () {
  const f = this.files[0];
  if (!f) return;
  attachedFile = f;
  const preview = document.getElementById('filePreview');
  preview.classList.remove('hidden');

  if (f.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = ev => {
      attachedDataUrl = ev.target.result;
      preview.innerHTML = `<img src="${attachedDataUrl}" style="height:40px;border-radius:4px;object-fit:cover"> ${f.name}`;
    };
    reader.readAsDataURL(f);
  } else {
    preview.innerHTML = `📄 ${f.name} (${(f.size/1024).toFixed(0)} KB)`;
    attachedDataUrl = null;
  }
});

document.getElementById('expenseForm').addEventListener('submit', e => {
  e.preventDefault();
  const cat = document.getElementById('expCategory').value;
  const extra = {};
  const extraDefs = CATEGORY_EXTRA[cat] || [];
  for (const f of extraDefs) {
    const el = document.getElementById(`ef_${f.id}`);
    if (el) extra[f.id] = el.value;
  }

  const expense = {
    id: nextId++,
    submitterId: currentUserId,
    date:        document.getElementById('expDate').value,
    submitDate:  '2026-06-26',
    category:    cat,
    amount:      parseInt(document.getElementById('expAmount').value, 10),
    payee:       document.getElementById('expPayee').value,
    memo:        document.getElementById('expMemo').value,
    extra,
    status:      'pending',
    receiptMock: false,
    receiptName: attachedFile ? attachedFile.name : null,
    receiptData: attachedDataUrl,
    settledDate: null,
    history: [
      { action: 'submitted', who: me().name, at: new Date().toISOString(), note: '' },
    ],
  };
  expenses.unshift(expense);
  save();

  document.getElementById('expenseForm').reset();
  document.getElementById('expDate').valueAsDate = new Date('2026-06-26');
  document.getElementById('filePreview').classList.add('hidden');
  document.getElementById('extraFieldsContainer').classList.add('hidden');
  document.getElementById('extraFields').innerHTML = '';
  attachedFile = null; attachedDataUrl = null;

  showToast('経費申請を提出しました ✓', 'success');
  updateBadge();
  switchView('dashboard');
});

document.getElementById('saveDraft').addEventListener('click', () => {
  showToast('下書きを保存しました', 'success');
});

// ── Approval ─────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tab));
  });
});

function renderApproval() {
  const role = me().role;
  let pendingItems, doneItems;

  if (role === 'manager') {
    document.getElementById('approvalTitle').textContent = '承認管理（上長）';
    pendingItems = expenses.filter(e => e.status === 'pending');
    doneItems    = expenses.filter(e => ['manager_approved','finance_pending','finance_processing','settled','rejected'].includes(e.status));
  } else {
    document.getElementById('approvalTitle').textContent = '承認管理（経理）';
    pendingItems = expenses.filter(e => e.status === 'manager_approved');
    doneItems    = expenses.filter(e => ['finance_pending','finance_processing','settled'].includes(e.status));
  }

  const badge = document.getElementById('pendingCountBadge');
  badge.textContent = pendingItems.length;
  badge.style.display = pendingItems.length ? 'inline-block' : 'none';

  document.getElementById('approvalList').innerHTML = renderApprovalCards(pendingItems, true, role);
  document.getElementById('doneList').innerHTML     = renderApprovalCards(doneItems, false, role);
}

function renderApprovalCards(list, showActions, role) {
  if (!list.length) return `
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
      <p>処理待ちの申請はありません</p>
    </div>`;

  return list.map(e => {
    const rejectEntry = e.history.find(h => h.action === 'rejected');
    const approver = currentApproverText(e);

    // Receipt inline (finance role)
    let receiptInline = '';
    if (role === 'finance') {
      if (e.receiptData) {
        receiptInline = `<img src="${e.receiptData}" class="card-receipt-img" onclick="event.stopPropagation();window.open('${e.receiptData}')" title="クリックで拡大">`;
      } else if (e.receiptMock) {
        receiptInline = `
          <div class="card-receipt-mock">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>領収書あり</span>
          </div>`;
      } else {
        receiptInline = `<div class="card-receipt-none">領収書なし</div>`;
      }
    }

    // Finance action buttons
    let financeActions = '';
    if (role === 'finance') {
      if (showActions && e.status === 'manager_approved') {
        financeActions = `
          <button class="btn-success" onclick="approveExpense(${e.id})">経理承認</button>
          <button class="btn-danger"  onclick="openRejectModal(${e.id})">差し戻し</button>`;
      } else if (e.status === 'finance_pending') {
        financeActions = `<button class="btn-warn" onclick="markProcessing(${e.id})">精算処理へ</button>`;
      } else if (e.status === 'finance_processing') {
        financeActions = `<button class="btn-success" onclick="markSettled(${e.id})">精算済みにする</button>`;
      }
    } else if (showActions) {
      financeActions = `
        <button class="btn-success" onclick="approveExpense(${e.id})">承認</button>
        <button class="btn-danger"  onclick="openRejectModal(${e.id})">差し戻し</button>`;
    }

    return `
    <div class="approval-card ${role === 'finance' ? 'approval-card-finance' : ''}">
      <div class="approval-card-top">
        <div class="approval-card-info">
          <div class="approval-card-title">${e.memo}</div>
          <div class="approval-card-meta">
            <span>👤 ${submitterName(e)}</span>
            <span>📅 ${formatDate(e.submitDate)}</span>
            <span>🏷 ${e.category}</span>
            <span>🏪 ${e.payee}</span>
          </div>
          ${approver && showActions ? `<div style="margin-top:6px"><span class="approver-tag">現在: ${approver}</span></div>` : ''}
          ${rejectEntry ? `<div class="reject-reason-box">差し戻し理由: ${rejectEntry.note}</div>` : ''}
        </div>
        <div style="display:flex;align-items:flex-start;gap:14px">
          ${receiptInline}
          <div class="approval-card-right">
            <div class="approval-card-amount">${fmt(e.amount)}</div>
            <div style="margin-top:6px">${statusBadge(e.status)}</div>
          </div>
        </div>
      </div>
      <div class="approval-actions">
        ${financeActions}
        <button class="btn-sm" onclick="openDetail(${e.id})">詳細 / 履歴</button>
      </div>
    </div>`;
  }).join('');
}

function approveExpense(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  const role = me().role;

  if (role === 'manager') {
    e.status = 'manager_approved';
    e.history.push({ action: 'manager_approved', who: me().name, at: new Date().toISOString(), note: '' });
    showToast('上長承認しました ✓', 'success');
  } else {
    // finance: 経理確認待ち → 経理承認済み
    e.status = 'finance_pending';
    e.history.push({ action: 'finance_approved', who: me().name, at: new Date().toISOString(), note: '' });
    e.settledDate = '2026-07-25';
    showToast('経理承認しました → 精算処理待ちへ ✓', 'success');
  }
  save(); renderApproval(); updateBadge();
}

function markProcessing(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  // 経理承認済み → 精算処理待ち
  e.status = 'finance_processing';
  e.history.push({ action: 'processing', who: me().name, at: new Date().toISOString(), note: '精算処理開始' });
  save(); renderApproval(); updateBadge();
  showToast('精算処理へ移行しました ✓', 'success');
}

function markSettled(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  // 精算処理待ち → 精算済み
  e.status = 'settled';
  e.settledDate = new Date().toISOString().slice(0,10);
  e.history.push({ action: 'settled', who: me().name, at: new Date().toISOString(), note: '振込完了' });
  save(); renderApproval(); updateBadge();
  showToast('精算済みにしました ✓', 'success');
}

function openRejectModal(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  document.getElementById('modalTitle').textContent = '差し戻し';
  document.getElementById('modalContent').innerHTML = `
    <p style="margin-bottom:12px;color:var(--gray-600)">差し戻し理由を入力してください。申請者に通知されます。</p>
    <p style="font-weight:600;margin-bottom:12px">${e.memo} — ${fmt(e.amount)}</p>
    <textarea id="rejectReason" rows="3" placeholder="理由を入力..." style="width:100%;margin-bottom:16px"></textarea>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn-secondary" onclick="closeModal()">キャンセル</button>
      <button class="btn-danger" onclick="rejectExpense(${id})">差し戻す</button>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function rejectExpense(id) {
  const e = expenses.find(x => x.id === id);
  const reason = document.getElementById('rejectReason').value.trim() || '要確認';
  if (e) {
    e.status = 'rejected';
    e.history.push({ action: 'rejected', who: me().name, at: new Date().toISOString(), note: reason });
    save();
  }
  closeModal(); renderApproval(); updateBadge();
  showToast('差し戻しました', 'error');
}

// ── History ───────────────────────────────────────────────────────────────────
function buildMonthFilter() {
  const months = [...new Set(expenses.map(e => monthKey(e.submitDate)))].sort().reverse();
  const sel = document.getElementById('filterMonth');
  sel.innerHTML = '<option value="all">全期間</option>' +
    months.map(m => `<option value="${m}">${m.replace('-','年')}月</option>`).join('');
}

document.getElementById('filterStatus').addEventListener('change', renderHistory);
document.getElementById('filterCategory').addEventListener('change', renderHistory);
document.getElementById('filterMonth').addEventListener('change', renderHistory);

document.getElementById('csvExport').addEventListener('click', exportCSV);
document.getElementById('dashCsvExport').addEventListener('click', exportCSV);

function renderHistory() {
  const role   = me().role;
  const stFil  = document.getElementById('filterStatus').value;
  const catFil = document.getElementById('filterCategory').value;
  const monFil = document.getElementById('filterMonth').value;

  let filtered = role === 'employee'
    ? expenses.filter(e => e.submitterId === currentUserId)
    : expenses;

  if (stFil  !== 'all') filtered = filtered.filter(e => e.status   === stFil);
  if (catFil !== 'all') filtered = filtered.filter(e => e.category === catFil);
  if (monFil !== 'all') filtered = filtered.filter(e => monthKey(e.submitDate) === monFil);
  filtered.sort((a, b) => b.submitDate.localeCompare(a.submitDate));

  document.getElementById('historyTableBody').innerHTML = filtered.length
    ? filtered.map(e => {
        const approver = currentApproverText(e);
        return `
          <tr onclick="openDetail(${e.id})">
            <td>${formatDate(e.submitDate)}</td>
            <td style="font-weight:600">${submitterName(e)}</td>
            <td><span style="font-size:11px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
            <td>${e.payee}</td>
            <td class="amount">${fmt(e.amount)}</td>
            <td>${statusBadge(e.status)}</td>
            <td>${approver ? `<span class="approver-tag">${approver}</span>` : '<span style="color:var(--gray-400);font-size:12px">—</span>'}</td>
            <td><button class="btn-sm" onclick="event.stopPropagation();openDetail(${e.id})">詳細</button></td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--gray-400)">該当する申請はありません</td></tr>';
}

// ── CSV Export ────────────────────────────────────────────────────────────────
// ── CSV Export Dialog ─────────────────────────────────────────────────────────
function exportCSV() {
  const role = me().role;

  // Read current filter values (history page filters; may not exist on dashboard)
  const stFil  = document.getElementById('filterStatus')?.value  || 'all';
  const catFil = document.getElementById('filterCategory')?.value || 'all';
  const monFil = document.getElementById('filterMonth')?.value   || 'all';

  // Build month options
  const months = [...new Set(expenses.map(e => monthKey(e.submitDate)))].sort().reverse();
  const monthOptions = ['<option value="all">全期間</option>',
    ...months.map(m => `<option value="${m}" ${monFil===m?'selected':''}>${m.replace('-','年')}月</option>`)
  ].join('');

  // Inject CSV dialog into modal
  document.getElementById('modal').querySelector('.modal').classList.remove('modal-wide');
  document.getElementById('modalTitle').textContent = 'CSV出力設定';
  document.getElementById('modalContent').innerHTML = `
    <div class="csv-dialog">
      <div class="csv-section">
        <div class="csv-section-label">対象期間</div>
        <select id="csvMonth" class="csv-select">${monthOptions}</select>
      </div>
      <div class="csv-section">
        <div class="csv-section-label">ステータス</div>
        <select id="csvStatus" class="csv-select">
          <option value="all">全ステータス</option>
          ${Object.entries(STATUS_LABEL).map(([k,v])=>`<option value="${k}" ${stFil===k?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="csv-section">
        <div class="csv-section-label">カテゴリ</div>
        <select id="csvCat" class="csv-select">
          <option value="all">全カテゴリ</option>
          ${['交通費','宿泊費','会議費','接待費','消耗品費','通信費','その他'].map(c=>`<option value="${c}" ${catFil===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="csv-section">
        <div class="csv-section-label">出力項目</div>
        <div class="csv-columns">
          ${[
            ['col_date',      '申請日',     true],
            ['col_usedate',   '使用日',     true],
            ['col_submitter', '申請者',     true],
            ['col_dept',      '部署',       true],
            ['col_cat',       'カテゴリ',   true],
            ['col_payee',     '支払先',     true],
            ['col_amount',    '金額',       true],
            ['col_memo',      '用途',       true],
            ['col_status',    'ステータス', true],
            ['col_mgr_name',  '上長承認者', false],
            ['col_mgr_date',  '上長承認日', false],
            ['col_fin_name',  '経理確認者', false],
            ['col_fin_date',  '経理確認日', false],
            ['col_settled',   '精算日',     false],
          ].map(([id, label, checked]) => `
            <label class="csv-col-check">
              <input type="checkbox" id="${id}" ${checked?'checked':''}> ${label}
            </label>`).join('')}
        </div>
      </div>
      <div class="csv-preview-row" id="csvPreviewRow"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
        <button class="btn-secondary" onclick="closeModal()">キャンセル</button>
        <button class="btn-primary" onclick="doExportCSV()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSVをダウンロード
        </button>
      </div>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');

  // Live preview count
  function updatePreview() {
    const mon = document.getElementById('csvMonth').value;
    const st  = document.getElementById('csvStatus').value;
    const cat = document.getElementById('csvCat').value;
    let d = role === 'employee' ? expenses.filter(e => e.submitterId === currentUserId) : expenses;
    if (mon !== 'all') d = d.filter(e => monthKey(e.submitDate) === mon);
    if (st  !== 'all') d = d.filter(e => e.status === st);
    if (cat !== 'all') d = d.filter(e => e.category === cat);
    document.getElementById('csvPreviewRow').textContent = `対象件数: ${d.length}件`;
  }
  ['csvMonth','csvStatus','csvCat'].forEach(id => document.getElementById(id).addEventListener('change', updatePreview));
  updatePreview();
}

function doExportCSV() {
  const role   = me().role;
  const mon    = document.getElementById('csvMonth').value;
  const st     = document.getElementById('csvStatus').value;
  const cat    = document.getElementById('csvCat').value;

  const colDefs = [
    ['col_date',      '申請日',     e => e.submitDate],
    ['col_usedate',   '使用日',     e => e.date],
    ['col_submitter', '申請者',     e => submitterName(e)],
    ['col_dept',      '部署',       e => (USERS[e.submitterId] || {}).dept || ''],
    ['col_cat',       'カテゴリ',   e => e.category],
    ['col_payee',     '支払先',     e => e.payee],
    ['col_amount',    '金額',       e => e.amount],
    ['col_memo',      '用途',       e => e.memo],
    ['col_status',    'ステータス', e => STATUS_LABEL[e.status] || e.status],
    ['col_mgr_name',  '上長承認者', e => e.history.find(h=>h.action==='manager_approved')?.who || ''],
    ['col_mgr_date',  '上長承認日', e => e.history.find(h=>h.action==='manager_approved')?.at?.slice(0,10) || ''],
    ['col_fin_name',  '経理確認者', e => e.history.find(h=>h.action==='finance_approved')?.who || ''],
    ['col_fin_date',  '経理確認日', e => e.history.find(h=>h.action==='finance_approved')?.at?.slice(0,10) || ''],
    ['col_settled',   '精算日',     e => e.settledDate || e.history.find(h=>h.action==='settled')?.at?.slice(0,10) || ''],
  ];

  const activeCols = colDefs.filter(([id]) => document.getElementById(id)?.checked);

  let data = role === 'employee' ? expenses.filter(e => e.submitterId === currentUserId) : expenses;
  if (mon !== 'all') data = data.filter(e => monthKey(e.submitDate) === mon);
  if (st  !== 'all') data = data.filter(e => e.status === st);
  if (cat !== 'all') data = data.filter(e => e.category === cat);
  data.sort((a,b) => b.submitDate.localeCompare(a.submitDate));

  const rows = [activeCols.map(([,label]) => label)];
  data.forEach(e => rows.push(activeCols.map(([,, fn]) => fn(e))));

  const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `経費精算_${mon !== 'all' ? mon : '全期間'}.csv`;
  a.click(); URL.revokeObjectURL(url);
  closeModal();
  showToast('CSVを出力しました ✓', 'success');
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function openDetail(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  document.getElementById('modalTitle').textContent = '申請詳細';

  const rejectEntry = e.history.find(h => h.action === 'rejected');
  const approver    = currentApproverText(e);

  // Extra fields
  const extraHtml = Object.entries(e.extra || {}).map(([k, v]) => {
    if (!v) return '';
    const defs = Object.values(CATEGORY_EXTRA).flat();
    const def  = defs.find(d => d.id === k);
    return `<div class="detail-row"><span class="detail-label">${def?.label || k}</span><span class="detail-value">${v}</span></div>`;
  }).join('');

  // Receipt
  let receiptHtml = '';
  if (e.receiptData) {
    receiptHtml = `
      <div class="receipt-box" onclick="window.open('${e.receiptData}')">
        <img src="${e.receiptData}" class="receipt-img-preview" />
        <div><div class="receipt-name">${e.receiptName}</div><div class="receipt-sub">クリックで拡大</div></div>
      </div>`;
  } else if (e.receiptMock) {
    receiptHtml = `
      <div class="receipt-box" style="cursor:default">
        <div class="receipt-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div><div class="receipt-name">領収書_${e.date.replace(/-/g,'')}.pdf</div><div class="receipt-sub">領収書あり（デモデータ）</div></div>
      </div>`;
  } else {
    receiptHtml = `<p class="receipt-none">領収書なし</p>`;
  }

  // Finance status pipeline
  const PIPELINE = [
    { key: 'pending',              label: '申請',        tip: '申請者が経費を申請した状態。上長の確認待ちです。' },
    { key: 'manager_approved',     label: '上長承認',    tip: '上長が内容を確認・承認しました。経理担当の確認待ちです。' },
    { key: 'finance_pending',      label: '経理確認済み', tip: '経理担当が内容を確認・承認しました。振込・給与反映の処理待ちです。' },
    { key: 'finance_processing',   label: '精算処理中',  tip: '振込または給与反映の処理を開始しています。支払完了まで少しお待ちください。' },
    { key: 'settled',              label: '精算済み',    tip: '支払が完了しました。振込または給与への加算が実行されています。' },
  ];
  const ORDER = ['pending','manager_approved','finance_pending','finance_processing','settled'];
  const curIdx = ORDER.indexOf(e.status);
  const financeHtml = `
    <div class="finance-pipeline">
      <div class="finance-pipeline-label">経理処理フロー</div>
      <div class="finance-pipeline-steps">
        ${PIPELINE.map((p, i) => {
          const done     = curIdx > i || e.status === p.key;
          const current  = e.status === p.key;
          const rejected = e.status === 'rejected';
          return `
            <div class="pipeline-step ${done && !rejected ? 'done' : ''} ${current ? 'current' : ''}">
              <div class="pipeline-dot">${done && !rejected ? '✓' : i+1}</div>
              <div class="pipeline-label">${p.label}</div>
            </div>
            ${i < PIPELINE.length-1 ? `<div class="pipeline-line ${curIdx > i && !rejected ? 'done' : ''}"></div>` : ''}
          `;
        }).join('')}
        ${(() => { const cur = PIPELINE.find(p => p.key === e.status); return cur ? `<div class="pipeline-tip-box" style="grid-column:1/-1;margin-top:10px">${cur.tip}</div>` : ''; })()}
      </div>
      ${e.settledDate ? `<div style="margin-top:8px;font-size:12px;color:var(--gray-500);text-align:center">精算予定日: <strong>${e.settledDate}</strong></div>` : ''}
    </div>
  `;

  // Timeline
  const ACTION_LABEL = {
    submitted:        '申請',
    manager_approved: '上長承認',
    finance_approved: '経理承認',
    processing:       '精算処理開始',
    settled:          '精算完了',
    rejected:         '差し戻し',
  };
  const ACTION_FUTURE = {
    manager_approved: '上長承認（待ち）',
    finance_approved: '経理承認（待ち）',
    processing:       '精算処理（待ち）',
    settled:          '精算完了（待ち）',
  };

  function fmtShort(iso) {
    if (!iso) return '';
    const dt = new Date(iso);
    return `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  }

  const timelineHtml = e.history.map(h => {
    const isRej = h.action === 'rejected';
    return `
      <div class="timeline-item">
        <div class="timeline-dot ${isRej ? 'rejected' : 'done'}">${isRej ? '✕' : '✓'}</div>
        <div class="timeline-body">
          <div class="timeline-row">
            <span class="timeline-when-inline">${fmtShort(h.at)}</span>
            <span class="timeline-who-inline">${h.who}</span>
            <span class="timeline-action-inline">${ACTION_LABEL[h.action] || h.action}</span>
          </div>
          ${h.note ? `<div class="timeline-note">${h.note}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  // Pending steps
  const nextSteps = [];
  if (!['settled','rejected'].includes(e.status)) {
    if (e.status === 'pending')            nextSteps.push('manager_approved','finance_approved','processing','settled');
    else if (e.status === 'manager_approved') nextSteps.push('finance_approved','processing','settled');
    else if (e.status === 'finance_pending')  nextSteps.push('processing','settled');
    else if (e.status === 'finance_processing') nextSteps.push('settled');
  }

  // Show current waiting line
  const currentLine = nextSteps.length && approver
    ? `<div class="timeline-item">
        <div class="timeline-dot pending" style="background:var(--warning-light);color:var(--warning);border-color:var(--warning)">…</div>
        <div class="timeline-body">
          <div class="timeline-row">
            <span class="timeline-when-inline" style="color:var(--warning)">現在</span>
            <span class="timeline-who-inline" style="color:var(--warning)">${approver}</span>
            <span class="timeline-action-inline" style="color:var(--warning)">${ACTION_FUTURE[nextSteps[0]] || '処理待ち'}</span>
          </div>
        </div>
       </div>`
    : '';

  const pendingStepsHtml = currentLine + nextSteps.slice(1).map(s => `
    <div class="timeline-item">
      <div class="timeline-dot pending">○</div>
      <div class="timeline-body">
        <div class="timeline-row">
          <span class="timeline-when-inline" style="color:var(--gray-300)">—</span>
          <span class="timeline-action-inline" style="color:var(--gray-400)">${ACTION_FUTURE[s] || s}</span>
        </div>
      </div>
    </div>`).join('');

  // ── Receipt section (single column, full width) ──
  let receiptSection = '';
  if (e.receiptData) {
    receiptSection = `
      <div class="detail-section">
        <div class="detail-section-title">領収書</div>
        <button type="button" class="detail-receipt-fullwidth" onclick="openLightbox(${e.id})">
          <img src="${e.receiptData}" class="detail-receipt-full-img">
          <div class="detail-receipt-overlay">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            タップして拡大
          </div>
        </button>
        <div class="detail-receipt-fname">${e.receiptName}</div>
      </div>`;
  } else if (e.receiptMock) {
    receiptSection = `
      <div class="detail-section">
        <div class="detail-section-title">領収書</div>
        <div class="detail-receipt-mock-row">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
          <div>
            <div style="font-weight:600;color:var(--gray-700)">領収書_${e.date.replace(/-/g,'')}.pdf</div>
            <div style="font-size:11px;color:var(--gray-400);margin-top:2px">デモデータ（PDF添付済み）</div>
          </div>
          <span class="receipt-ok-badge">✓ 添付済み</span>
        </div>
      </div>`;
  } else {
    receiptSection = `
      <div class="detail-section">
        <div class="detail-section-title">領収書</div>
        <div class="detail-receipt-none-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          領収書なし
        </div>
      </div>`;
  }

  document.getElementById('modal').querySelector('.modal').classList.remove('modal-wide');
  document.getElementById('modalContent').innerHTML = `
    ${e.status === 'rejected' ? `
      <div class="reject-note-box">
        <div class="reject-note-label">⚠ 差し戻し理由</div>
        <div class="reject-note-text">${rejectEntry?.note || ''}</div>
      </div>` : ''}

    <!-- ① 申請内容 -->
    <div class="detail-section">
      <div class="detail-section-title">申請内容</div>
      <div class="detail-info-grid">
        <div class="detail-info-row"><span class="detail-label">申請日</span><span class="detail-value">${formatDate(e.submitDate)}</span></div>
        <div class="detail-info-row"><span class="detail-label">使用日</span><span class="detail-value">${formatDate(e.date)}</span></div>
        <div class="detail-info-row"><span class="detail-label">申請者</span><span class="detail-value">${submitterName(e)}</span></div>
        <div class="detail-info-row"><span class="detail-label">カテゴリ</span><span class="detail-value">${e.category}</span></div>
        <div class="detail-info-row"><span class="detail-label">支払先</span><span class="detail-value">${e.payee}</span></div>
        <div class="detail-info-row amount-row"><span class="detail-label">金額</span><span class="detail-value detail-amount">${fmt(e.amount)}</span></div>
        <div class="detail-info-row full-row"><span class="detail-label">用途</span><span class="detail-value">${e.memo}</span></div>
        ${extraHtml ? `<div class="detail-info-row full-row extra-rows">${extraHtml}</div>` : ''}
        <div class="detail-info-row"><span class="detail-label">ステータス</span><span class="detail-value">
          ${statusBadge(e.status)}
          ${approver ? `<span class="approver-tag" style="margin-left:6px">→ ${approver}</span>` : ''}
        </span></div>
      </div>
    </div>

    <!-- ② 領収書 -->
    ${receiptSection}

    <!-- ③ 経理処理フロー -->
    <div class="detail-section">
      ${financeHtml}
    </div>

    <!-- ④ 承認タイムライン -->
    <div class="detail-section">
      <div class="detail-section-title">承認タイムライン</div>
      <div class="timeline">${timelineHtml}${pendingStepsHtml}</div>
    </div>

    <div style="text-align:right;margin-top:4px;padding-top:16px;border-top:1px solid var(--gray-100)">
      <button class="btn-secondary" onclick="closeModal()">閉じる</button>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').querySelector('.modal').classList.remove('modal-wide');
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function updateBadge() {
  const role = me().role;
  let n = 0;
  if (role === 'manager') n = expenses.filter(e => e.status === 'pending').length;
  if (role === 'finance') n = expenses.filter(e => e.status === 'manager_approved').length;
  const badge = document.getElementById('pendingBadge');
  badge.textContent = n;
  badge.classList.toggle('visible', n > 0);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function openLightbox(expId) {
  const e = expenses.find(x => x.id === Number(expId));
  if (!e || !e.receiptData) return;
  // Blob URL方式 — data: URIより確実にブラウザが開ける
  const [header, b64] = e.receiptData.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const url  = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) {
    // ポップアップブロックされた場合はページ内に表示
    const lb = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = e.receiptData;
    lb.style.cssText = 'display:flex!important;position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(0,0,0,.88);align-items:center;justify-content:center;padding:24px;';
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.style.cssText = 'display:none!important;';
  document.getElementById('lightboxImg').src = '';
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderDemoSwitcher();
updateNavVisibility();
updateMonthLabel();
buildMonthFilter();
renderDashboard();
updateBadge();
