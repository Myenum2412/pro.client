# Invoice Details & Payment Feature Flow

## 🔄 User Interaction Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER STARTS HERE                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Choose Page    │
                    └─────────────────┘
                         │         │
            ┌────────────┘         └────────────┐
            ▼                                   ▼
   ┌─────────────────┐                ┌─────────────────┐
   │  Project Page   │                │  Billing Page   │
   │  Invoice Table  │                │  Invoice Table  │
   └─────────────────┘                └─────────────────┘
            │                                   │
            └────────────┬────────────┬─────────┘
                         ▼            ▼
              ┌──────────────────────────────┐
              │   Click Invoice Row          │
              │   OR                         │
              │   Click View Details Button  │
              └──────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Invoice Details     │
              │  Dialog Opens        │
              └──────────────────────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      ┌─────────┐  ┌─────────┐  ┌─────────┐
      │  Print  │  │Download │  │Pay Now  │
      └─────────┘  └─────────┘  └─────────┘
                                      │
                                      ▼
                         ┌─────────────────────┐
                         │  Razorpay Gateway   │
                         │  Opens              │
                         └─────────────────────┘
                                      │
                         ┌────────────┼────────────┐
                         ▼                         ▼
              ┌──────────────────┐      ┌──────────────────┐
              │  Payment Success │      │  Payment Failed  │
              └──────────────────┘      └──────────────────┘
                         │                         │
                         ▼                         ▼
              ┌──────────────────┐      ┌──────────────────┐
              │  Status Updated  │      │  Retry Payment   │
              │  to "Paid"       │      │  OR              │
              └──────────────────┘      │  Contact Support │
                         │               └──────────────────┘
                         ▼
              ┌──────────────────┐
              │  Page Refreshes  │
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Updated Status  │
              │  Visible         │
              │  Everywhere      │
              └──────────────────┘
```

## 🎯 Access Points

### 1. Project Page Access

```
Project Page
  └── Project Details
        └── Invoice History Table
              ├── Row Click → Invoice Details Dialog
              └── Actions Column
                    ├── View Details Button → Invoice Details Dialog
                    └── Pay Now Button → Payment Gateway
```

### 2. Billing Page Access

```
Billing Page
  └── Invoice History Table
        ├── Row Click → Invoice Details Dialog
        └── Actions Column
              ├── View Details Button → Invoice Details Dialog
              └── Pay Now Button → Payment Gateway
```

## 💳 Payment Flow Detail

### Step-by-Step Payment Process

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Initiates Payment                             │
├─────────────────────────────────────────────────────────────┤
│ • User clicks "Pay Now" button                              │
│ • Button shows loading state                                │
│ • Payment amount: invoice.totalAmountBilled                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Load Razorpay Script                               │
├─────────────────────────────────────────────────────────────┤
│ • Check if script already loaded                            │
│ • If not, inject script tag                                 │
│ • Wait for script to load                                   │
│ • Handle load errors                                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Create Payment Order                               │
├─────────────────────────────────────────────────────────────┤
│ • Call API: POST /api/payments/create-order                 │
│ • Send: amount, invoiceId, invoiceNo, currency              │
│ • Receive: orderId, amount, currency                        │
│ • Handle API errors                                         │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Open Razorpay Checkout                             │
├─────────────────────────────────────────────────────────────┤
│ • Initialize Razorpay with options                          │
│ • Set payment gateway configuration                         │
│ • Display payment modal to user                             │
│ • User enters payment details                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: User Completes Payment                             │
├─────────────────────────────────────────────────────────────┤
│ • User selects payment method                               │
│ • User enters payment credentials                           │
│ • User confirms payment                                     │
│ • Razorpay processes payment                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Payment Response                                    │
├─────────────────────────────────────────────────────────────┤
│ • Razorpay returns response                                 │
│ • Contains: razorpay_order_id, razorpay_payment_id,        │
│   razorpay_signature                                        │
│ • Handler function triggered                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Verify Payment                                     │
├─────────────────────────────────────────────────────────────┤
│ • Call API: POST /api/payments/verify                       │
│ • Send: order_id, payment_id, signature, invoiceId, amount │
│ • Server verifies signature                                 │
│ • Server updates invoice status                             │
│ • Receive: success status, paymentId                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Update UI                                          │
├─────────────────────────────────────────────────────────────┤
│ • Show success message                                      │
│ • Display payment ID                                        │
│ • Reload page (window.location.reload())                    │
│ • Updated status visible everywhere                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔀 State Management Flow

### Component State Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Parent Component (ProjectSections / BillingInvoicesTable)  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State:                                                     │
│  const [invoiceDetailsDialog, setInvoiceDetailsDialog] =   │
│    useState({ open: false, invoice: null })                │
│                                                             │
│  Handler:                                                   │
│  const handleViewInvoiceDetails = (invoice) => {           │
│    setInvoiceDetailsDialog({ open: true, invoice })        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ├─────────────────────────────┐
                         ▼                             ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  SectionTableCard            │    │  InvoiceDetailsDialog        │
├──────────────────────────────┤    ├──────────────────────────────┤
│                              │    │                              │
│  Props:                      │    │  Props:                      │
│  • onRowClick                │    │  • open                      │
│  • onViewDetails             │    │  • onOpenChange              │
│                              │    │  • invoice                   │
│  Triggers:                   │    │                              │
│  • Row click                 │    │  Contains:                   │
│  • View Details button       │    │  • Invoice information       │
│                              │    │  • Action buttons            │
└──────────────────────────────┘    │  • PayNowButton              │
                                    └──────────────────────────────┘
                                                  │
                                                  ▼
                                    ┌──────────────────────────────┐
                                    │  PayNowButton                │
                                    ├──────────────────────────────┤
                                    │                              │
                                    │  Props:                      │
                                    │  • invoice                   │
                                    │  • onBeforePayment           │
                                    │                              │
                                    │  Handles:                    │
                                    │  • Payment initiation        │
                                    │  • Razorpay integration      │
                                    │  • Status updates            │
                                    └──────────────────────────────┘
```

## 📊 Data Flow

### Invoice Data Journey

```
┌─────────────────────────────────────────────────────────────┐
│ Database (Supabase)                                         │
│ Table: invoices                                             │
├─────────────────────────────────────────────────────────────┤
│ • id, invoiceNo, projectNo, contractor                      │
│ • projectName, billedTonnage, unitPriceOrLumpSum           │
│ • tonsBilledAmount, billedHoursCo, coPrice                 │
│ • coBilledAmount, totalAmountBilled, status                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ API Layer                                                   │
│ /api/invoices or TanStack Query hooks                      │
├─────────────────────────────────────────────────────────────┤
│ • Fetch invoice data                                        │
│ • Transform data                                            │
│ • Handle errors                                             │
│ • Cache responses                                           │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Component State                                             │
│ useBillingInvoices() / useInvoiceHistory()                 │
├─────────────────────────────────────────────────────────────┤
│ • Store invoice list                                        │
│ • Manage loading states                                     │
│ • Handle pagination                                         │
│ • Provide data to components                                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Table Display                                               │
│ SectionTableCard                                            │
├─────────────────────────────────────────────────────────────┤
│ • Render invoice rows                                       │
│ • Apply sorting/filtering                                   │
│ • Handle row clicks                                         │
│ • Display action buttons                                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Details Dialog                                              │
│ InvoiceDetailsDialog                                        │
├─────────────────────────────────────────────────────────────┤
│ • Display full invoice details                              │
│ • Format currency values                                    │
│ • Show payment status                                       │
│ • Provide action buttons                                    │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Payment Processing                                          │
│ PayNowButton → Razorpay → Verification                     │
├─────────────────────────────────────────────────────────────┤
│ • Create payment order                                      │
│ • Process payment                                           │
│ • Verify payment                                            │
│ • Update invoice status                                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Database Update                                             │
│ invoices.status = "Paid"                                    │
├─────────────────────────────────────────────────────────────┤
│ • Update invoice record                                     │
│ • Create payment record                                     │
│ • Log transaction                                           │
│ • Trigger notifications                                     │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ UI Refresh                                                  │
│ window.location.reload()                                    │
├─────────────────────────────────────────────────────────────┤
│ • Reload page                                               │
│ • Fetch updated data                                        │
│ • Display new status                                        │
│ • Clear cache                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
└── SidebarProvider
    ├── AppSidebar
    └── SidebarInset
        ├── TopHeader
        └── Page Content
            │
            ├── Project Page
            │   └── ProjectSections
            │       ├── SectionTableCard (Invoice History)
            │       │   ├── Table
            │       │   │   └── TableRow (clickable)
            │       │   └── Actions Column
            │       │       ├── View Details Button
            │       │       └── Pay Now Button
            │       └── InvoiceDetailsDialog
            │           ├── Dialog Header
            │           ├── Dialog Content (scrollable)
            │           │   ├── Invoice Information
            │           │   ├── Tonnage Billing
            │           │   ├── Change Order Billing
            │           │   └── Total Amount
            │           └── Dialog Footer
            │               ├── Print Button
            │               ├── Download Button
            │               ├── Close Button
            │               └── PayNowButton
            │                   └── Razorpay Integration
            │
            └── Billing Page
                └── BillingInvoicesTable
                    ├── SectionTableCard (Invoice History)
                    │   ├── Table
                    │   │   └── TableRow (clickable)
                    │   └── Actions Column
                    │       ├── View Details Button
                    │       └── Pay Now Button
                    └── InvoiceDetailsDialog
                        └── [Same structure as above]
```

## 🔐 Security Flow

### Payment Security Measures

```
┌─────────────────────────────────────────────────────────────┐
│ Client Side                                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. User initiates payment                                   │
│ 2. Client creates order request                             │
│ 3. Client receives order_id (no sensitive data)             │
│ 4. Razorpay handles payment (secure iframe)                 │
│ 5. Client receives payment response                         │
│ 6. Client sends verification request                        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Server Side                                                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Verify user authentication                               │
│ 2. Create order with Razorpay API                           │
│ 3. Store order details in database                          │
│ 4. Return order_id to client                                │
│ 5. Receive verification request                             │
│ 6. Verify signature with Razorpay secret                    │
│ 7. Update invoice status if valid                           │
│ 8. Return verification result                               │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ Security Checks                                             │
├─────────────────────────────────────────────────────────────┤
│ ✓ User authentication required                              │
│ ✓ HTTPS for all communications                              │
│ ✓ Razorpay signature verification                           │
│ ✓ Server-side payment validation                            │
│ ✓ No sensitive data in client code                          │
│ ✓ API keys stored in environment variables                  │
│ ✓ Database transactions for consistency                     │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Responsive Behavior

### Desktop (> 768px)
```
┌─────────────────────────────────────────────────────────────┐
│ Invoice Details Dialog                    [Status] [Close]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Invoice #: INV-001   │  │ Project #: P-001     │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
│  Tonnage Billing                                            │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐                 │
│  │ Tonnage │ │  Price  │ │    Amount    │                 │
│  └─────────┘ └─────────┘ └──────────────┘                 │
│                                                             │
│  Change Order Billing                                       │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐                 │
│  │  Hours  │ │  Price  │ │    Amount    │                 │
│  └─────────┘ └─────────┘ └──────────────┘                 │
│                                                             │
│  Total: $10,500.00                                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Print] [Download]              [Close] [Pay Now]         │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────────────────┐
│ Invoice Details [Close]  │
├──────────────────────────┤
│                          │
│ Invoice #: INV-001       │
│                          │
│ Project #: P-001         │
│                          │
│ Tonnage Billing          │
│ ┌──────────────────────┐ │
│ │ Tonnage: 150.00      │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Price: $50/ton       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Amount: $7,500.00    │ │
│ └──────────────────────┘ │
│                          │
│ Change Order Billing     │
│ ┌──────────────────────┐ │
│ │ Hours: 40.0          │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Price: $75/hr        │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ Amount: $3,000.00    │ │
│ └──────────────────────┘ │
│                          │
│ Total: $10,500.00        │
│                          │
├──────────────────────────┤
│ [Print] [Download]       │
│ [Close] [Pay Now]        │
└──────────────────────────┘
```

---

**Visual Guide Version**: 1.0.0
**Last Updated**: December 26, 2025

