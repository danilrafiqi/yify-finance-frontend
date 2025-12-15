# Shared Resources Analysis

## Current Structure

```
frontend/src/
├── utils/          # Shared types & utilities
├── hooks/          # Shared hooks (cross-module)
├── components/     # Shared components (cross-module)
└── shared/         # Shared hooks & lib (yang baru dibuat)
```

## Analysis

### 1. `utils/` folder
**Current:** `utils/types.ts` - NFT types, LenderPosition types
**Usage:** 
- `pages/borrower/BorrowerDetail.tsx` - import NFT type
- `components/common/NFTCard.tsx` - import NFT type

**Status:** ✅ Masih dipakai, tapi ada duplikasi dengan `modules/borrow/models/loan.ts` dan `modules/lend/models/position.ts`

**Recommendation:**
- **Option A:** Pindahkan ke `shared/types/` untuk konsistensi
- **Option B:** Tetap di `utils/` karena memang shared utility
- **Option C:** Hapus, gunakan types dari modules (Loan, LenderPosition)

### 2. `hooks/` folder
**Current:**
- `hooks/usePlatformStats.ts` - Platform stats (TVL, total borrow, available fund)
- `hooks/useLenderPosition.ts` - Lender position & transactions (OLD, sudah tidak dipakai)

**Usage:**
- `usePlatformStats` → dipakai di `modules/landing/viewmodels/landing.viewmodel.ts` dan `modules/admin/viewmodels/admin.viewmodel.ts`
- `useLenderPosition` → **TIDAK DIPAKAI LAGI** (sudah ada di `modules/lend/viewmodels/dashboard.viewmodel.ts`)

**Status:** 
- `usePlatformStats` ✅ Masih dipakai (shared hook)
- `useLenderPosition` ❌ Tidak dipakai lagi (bisa dihapus)

**Recommendation:**
- **Option A:** Pindahkan `usePlatformStats` ke `shared/hooks/` untuk konsistensi
- **Option B:** Tetap di `hooks/` karena memang shared hook
- **Hapus** `useLenderPosition.ts` karena sudah tidak dipakai

### 3. `components/` folder
**Current:**
- `components/common/Header.tsx` - App header
- `components/common/NotificationSystem.tsx` - Toast notifications
- `components/common/NFTCard.tsx` - NFT display card
- `components/common/WalletConnection.tsx` - Wallet connection (perlu dicek apakah dipakai)

**Usage:**
- `Header` → dipakai di `App.tsx`
- `NotificationSystem` → dipakai di `App.tsx`
- `NFTCard` → dipakai di `pages/borrower/BorrowerDetail.tsx` dan kemungkinan di tempat lain

**Status:** ✅ Semua masih dipakai, shared components

**Recommendation:**
- **Option A:** Tetap di `components/common/` (sudah jelas sebagai shared)
- **Option B:** Pindahkan ke `shared/components/` untuk konsistensi dengan `shared/hooks/` dan `shared/lib/`

## Pattern Comparison

### Module-Based Pattern (Feature-Specific)
```
modules/
├── borrow/
│   ├── models/      # Domain models untuk borrow
│   ├── services/     # Business logic untuk borrow
│   ├── viewmodels/   # ViewModels untuk borrow pages
│   └── components/   # Components khusus untuk borrow
```

### Shared Resources Pattern (Cross-Module)
```
shared/ (atau utils/, hooks/, components/)
├── types/            # Shared types (digunakan oleh semua modules)
├── hooks/            # Shared hooks (digunakan oleh semua modules)
├── components/       # Shared components (digunakan oleh semua modules)
└── lib/              # Shared utilities (GraphQL client, dll)
```

## Recommendation

**Konsistensi Pattern:**
- Semua shared resources sebaiknya di `shared/` untuk konsistensi
- Atau tetap di root (`utils/`, `hooks/`, `components/`) karena memang berbeda dari module pattern

**Action Items:**
1. ✅ Pindahkan LandingPage & HelpFAQ ke folder (DONE)
2. ⚠️ Hapus `hooks/useLenderPosition.ts` (tidak dipakai lagi)
3. ⚠️ Pindahkan `usePlatformStats` ke `shared/hooks/` atau tetap di `hooks/`
4. ⚠️ Pindahkan `utils/types.ts` ke `shared/types/` atau tetap di `utils/`
5. ⚠️ Pindahkan `components/common/` ke `shared/components/` atau tetap di `components/common/`

## Decision

**Pilih salah satu:**

### Option 1: Konsisten dengan `shared/`
```
shared/
├── types/
│   └── index.ts
├── hooks/
│   ├── use-platform-stats.ts
│   └── use-contract-addresses.ts
├── components/
│   ├── Header.tsx
│   ├── NotificationSystem.tsx
│   └── NFTCard.tsx
└── lib/
    └── graphql.ts
```

### Option 2: Tetap di root (current)
```
utils/
├── types.ts
hooks/
├── usePlatformStats.ts
components/
└── common/
    ├── Header.tsx
    ├── NotificationSystem.tsx
    └── NFTCard.tsx
shared/
├── hooks/
│   └── use-contract-addresses.ts
└── lib/
    └── graphql.ts
```

**Rekomendasi:** Option 1 (konsisten dengan `shared/`) karena:
- Lebih konsisten dengan pattern yang sudah dibuat
- Semua shared resources di satu tempat
- Lebih mudah di-maintain

