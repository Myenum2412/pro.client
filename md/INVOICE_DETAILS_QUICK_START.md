# Invoice Details & Payment - Quick Start Guide

## 🚀 Quick Overview

View detailed invoice information and make payments directly from the Invoice History table on both the Project Page and Billing Page.

## 📍 Where to Find It

### Option 1: Project Page
1. Navigate to any project
2. Scroll to "Invoice History" table
3. Click on any invoice row **OR** click the eye icon in the Actions column

### Option 2: Billing Page
1. Navigate to Billing & Invoices page
2. Find the "Invoice History" table
3. Click on any invoice row **OR** click the eye icon in the Actions column

## 💡 What You'll See

### Invoice Details Dialog

**Header**
- 📄 Invoice Number
- 🏢 Project Number
- ✅ Payment Status Badge

**Tonnage Billing** (Green Section)
- Billed tonnage in tons
- Unit price or lump sum
- Total tons billed amount

**Change Order Billing** (Blue Section)
- Billed hours for change orders
- Change order price
- Total CO billed amount

**Total Amount** (Highlighted)
- Large display of total amount billed
- Payment status indicator

**Action Buttons**
- 🖨️ **Print**: Print the invoice
- 📥 **Download PDF**: Download as PDF
- 💳 **Pay Now**: Make payment (unpaid invoices only)
- ❌ **Close**: Close the dialog

## 💳 Making a Payment

### For Unpaid Invoices

1. **Open Invoice Details**
   - Click on any unpaid invoice row
   - Look for invoices with "Pending", "Overdue", or "Draft" status

2. **Click Pay Now**
   - Green button at the bottom right
   - Or use the Pay Now button in the table's Actions column

3. **Complete Payment**
   - Razorpay payment gateway will open
   - Enter payment details
   - Confirm payment

4. **Confirmation**
   - Success message appears
   - Invoice status updates to "Paid"
   - Page refreshes automatically

### Payment Status Indicators

| Status | Pay Now Available | Indicator |
|--------|-------------------|-----------|
| ✅ Paid | No | Green "✓ Paid" text |
| ⏳ Pending | Yes | Green "Pay Now" button |
| ⚠️ Overdue | Yes | Green "Pay Now" button |
| 📝 Draft | Yes | Green "Pay Now" button |
| ❌ Cancelled | No | Status badge only |

## 🎯 Key Features

### Row Click
- Click anywhere on an invoice row to view details
- No need to find the specific button
- Works on both Project and Billing pages

### View Details Button
- Eye icon (👁️) in the Actions column
- Alternative way to open details
- Includes helpful tooltip

### Consistent Experience
- Same dialog on both pages
- Same payment flow everywhere
- Real-time status updates

### Responsive Design
- Works on desktop, tablet, and mobile
- Scrollable content for long invoices
- Touch-friendly buttons

## 🔧 Common Actions

### View Invoice Details
```
1. Navigate to Invoice History table
2. Click on any invoice row
3. Review all invoice information
4. Click Close when done
```

### Pay an Invoice
```
1. Click on unpaid invoice row
2. Review invoice details
3. Click "Pay Now" button
4. Complete payment in gateway
5. Wait for confirmation
```

### Print Invoice
```
1. Open invoice details
2. Click "Print" button
3. Use browser print dialog
4. Select printer and print
```

### Download Invoice
```
1. Open invoice details
2. Click "Download PDF" button
3. PDF will download automatically
```

## 📱 Mobile Usage

### Viewing on Mobile
- Dialog adapts to screen size
- Single-column layout
- Full-width buttons
- Scrollable content

### Making Payments on Mobile
- Same payment flow as desktop
- Razorpay mobile-optimized
- Touch-friendly interface

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close dialog |
| `Enter` | Confirm payment (when focused) |
| `Tab` | Navigate between buttons |

## 🎨 Visual Guide

### Invoice Details Layout

```
┌─────────────────────────────────────────────┐
│ 📄 Invoice Details              [Status] [×]│
├─────────────────────────────────────────────┤
│                                             │
│  📄 Invoice #: INV-001    🏢 Project #: P1  │
│                                             │
│  Project Name: Example Project              │
│  Contractor: ABC Construction               │
│                                             │
├─────────────────────────────────────────────┤
│  💰 Tonnage Billing                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐  │
│  │ 150.00  │ │ $50/ton │ │  $7,500.00   │  │
│  │ tons    │ │         │ │              │  │
│  └─────────┘ └─────────┘ └──────────────┘  │
│                                             │
│  📅 Change Order Billing                    │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐  │
│  │ 40.0    │ │ $75/hr  │ │  $3,000.00   │  │
│  │ hours   │ │         │ │              │  │
│  └─────────┘ └─────────┘ └──────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  Total Amount Billed:         $10,500.00   │
├─────────────────────────────────────────────┤
│  [🖨️ Print] [📥 Download]  [Close] [💳 Pay]│
└─────────────────────────────────────────────┘
```

## ❓ FAQ

### Q: Can I pay multiple invoices at once?
A: Currently, each invoice must be paid individually. Bulk payment is planned for a future update.

### Q: What payment methods are supported?
A: All payment methods supported by Razorpay (credit/debit cards, UPI, net banking, wallets).

### Q: Can I download a receipt after payment?
A: After payment, the invoice status updates to "Paid". Receipt download is planned for a future update.

### Q: What if payment fails?
A: You'll see an error message. You can try again or contact support if the issue persists.

### Q: Can I view paid invoices?
A: Yes! You can view details of any invoice regardless of payment status. The Pay Now button only appears for unpaid invoices.

### Q: How do I know if payment was successful?
A: You'll see a success message, and the invoice status will update to "Paid" immediately.

## 🆘 Troubleshooting

### Dialog Won't Open
- Refresh the page
- Check if you have permission to view invoices
- Try clicking the View Details button instead of the row

### Pay Now Button Missing
- Check invoice status (must be Pending, Overdue, or Draft)
- Verify you have payment permissions
- Refresh the page

### Payment Gateway Not Loading
- Check internet connection
- Disable browser extensions temporarily
- Try a different browser
- Clear browser cache

### Status Not Updating
- Wait a few seconds and refresh
- Check your email for payment confirmation
- Contact support if status doesn't update within 5 minutes

## 📞 Need Help?

- 📖 Full documentation: `docs/INVOICE_DETAILS_FEATURE.md`
- 💬 Contact support team
- 🐛 Report issues to development team

---

**Quick Tip**: You can click anywhere on an invoice row to quickly view its details! No need to hunt for the View Details button. 🎯

