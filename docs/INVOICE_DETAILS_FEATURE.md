# Invoice Details & Payment Feature

## Overview

The Invoice Details feature provides a comprehensive view of invoice information with integrated payment capabilities. Users can access detailed invoice information from both the Project Page (Invoice History table) and the dedicated Billing Page, with consistent behavior and styling across both locations.

## Key Features

### 1. **Multiple Access Points**
- **Project Page**: Click on any row in the "Invoice History" table
- **Billing Page**: Click on any row in the "Invoice History" table
- **View Details Button**: Click the eye icon in the Actions column

### 2. **Comprehensive Invoice Details Dialog**

The dialog displays complete invoice information in an organized, visually appealing layout:

#### Header Section
- Invoice number with icon
- Project number with icon
- Current payment status badge
- Close button for easy dismissal

#### Project Information
- Project name
- Contractor name
- Visual organization with icons and color-coded sections

#### Tonnage Billing Section
- Billed tonnage (in tons)
- Unit price or lump sum
- Calculated tons billed amount
- Highlighted in emerald color scheme

#### Change Order Billing Section
- Billed hours for change orders
- Change order price
- Calculated CO billed amount
- Highlighted in blue color scheme

#### Total Amount Section
- Large, prominent display of total amount billed
- Gradient background for emphasis
- Payment status indicator

#### Action Buttons
- **Print**: Opens print dialog for the invoice
- **Download PDF**: Downloads invoice as PDF (to be implemented)
- **Pay Now**: Initiates payment flow (for unpaid invoices only)
- **Close**: Closes the dialog

### 3. **Pay Now Integration**

#### Conditional Display
- **Visible**: For invoices with status "Pending", "Overdue", or "Draft"
- **Hidden**: For invoices with status "Paid" or "Cancelled"

#### Payment Flow
1. User clicks "Pay Now" button
2. Razorpay payment gateway loads
3. User completes payment
4. Payment verification occurs server-side
5. Invoice status updates to "Paid"
6. UI refreshes to reflect new status

#### Consistent Behavior
- Same payment logic across all locations:
  - Invoice Details Dialog (from Project Page)
  - Invoice Details Dialog (from Billing Page)
  - Direct "Pay Now" button in table Actions column
- All payment buttons trigger the same Razorpay integration
- Real-time status updates after successful payment

### 4. **Responsive Design**

#### Desktop View
- Two-column layout for invoice header
- Three-column grid for billing sections
- Side-by-side action buttons

#### Mobile View
- Single-column layout
- Stacked billing information
- Full-width buttons
- Scrollable content area

### 5. **User Experience Enhancements**

#### Visual Feedback
- Gradient backgrounds for emphasis
- Color-coded sections (emerald for tonnage, blue for change orders)
- Icon indicators for different information types
- Status badges with appropriate colors

#### Accessibility
- Keyboard navigation support
- Tooltips on action buttons
- Clear visual hierarchy
- High contrast text

#### Loading States
- Spinner on "Pay Now" button during processing
- Disabled state for unavailable actions
- Smooth transitions and animations

## Technical Implementation

### Components

#### `InvoiceDetailsDialog`
**Location**: `components/billing/invoice-details-dialog.tsx`

**Props**:
```typescript
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: BillingInvoiceRow | null;
}
```

**Features**:
- Scrollable content area for long invoices
- Conditional rendering based on payment status
- Integration with PayNowButton component
- Print and download functionality

#### `PayNowButton`
**Location**: `components/billing/pay-now-button.tsx`

**Props**:
```typescript
{
  invoice: BillingInvoiceRow;
  onBeforePayment?: () => void;
}
```

**Features**:
- Razorpay integration
- Loading states
- Error handling
- Payment verification
- Status updates

### State Management

#### Project Page
**File**: `components/projects/project-sections.tsx`

```typescript
const [invoiceDetailsDialog, setInvoiceDetailsDialog] = useState<{
  open: boolean;
  invoice: InvoiceRow | null;
}>({
  open: false,
  invoice: null,
});

const handleViewInvoiceDetails = useCallback((invoice: InvoiceRow) => {
  setInvoiceDetailsDialog({ open: true, invoice });
}, []);
```

#### Billing Page
**File**: `components/billing/billing-invoices-table.tsx`

```typescript
const [invoiceDetailsDialog, setInvoiceDetailsDialog] = useState<{
  open: boolean;
  invoice: BillingInvoiceRow | null;
}>({
  open: false,
  invoice: null,
});

const handleViewInvoiceDetails = useCallback((invoice: BillingInvoiceRow) => {
  setInvoiceDetailsDialog({ open: true, invoice });
}, []);
```

### Table Integration

Both tables use the same pattern:

```typescript
<SectionTableCard
  title="Invoice History"
  data={invoices}
  columns={invoiceColumns}
  onRowClick={handleViewInvoiceDetails} // Click anywhere on row
  onViewDetails={handleViewInvoiceDetails} // Click View Details button
  // ... other props
/>
```

### Column Definition

**File**: `components/billing/invoice-columns.tsx`

The Actions column includes:
- View Details button (eye icon) with tooltip
- Pay Now button (for unpaid invoices)
- Paid indicator (for paid invoices)

```typescript
{
  id: "actions",
  header: () => <div className="text-center font-semibold">Actions</div>,
  cell: ({ row, table }) => {
    const status = row.original.status;
    const canPay = status !== "Paid" && status !== "Cancelled";
    const onViewDetails = (table.options.meta as any)?.onViewDetails;
    
    return (
      <div className="flex justify-center items-center gap-1">
        <Button onClick={() => onViewDetails?.(row.original)}>
          <Eye className="h-4 w-4" />
        </Button>
        {canPay ? (
          <PayNowButton invoice={row.original} />
        ) : (
          <span>✓ Paid</span>
        )}
      </div>
    );
  },
}
```

## Payment Status Flow

### Status Types
1. **Pending**: Invoice awaiting payment
2. **Overdue**: Invoice past due date
3. **Draft**: Invoice not yet finalized
4. **Paid**: Invoice successfully paid
5. **Cancelled**: Invoice cancelled

### Status-Based Behavior

| Status | Pay Now Button | View Details | Row Click |
|--------|---------------|--------------|-----------|
| Pending | ✅ Enabled | ✅ Available | ✅ Works |
| Overdue | ✅ Enabled | ✅ Available | ✅ Works |
| Draft | ✅ Enabled | ✅ Available | ✅ Works |
| Paid | ❌ Hidden | ✅ Available | ✅ Works |
| Cancelled | ❌ Hidden | ✅ Available | ✅ Works |

## Real-Time Updates

After successful payment:
1. Server updates invoice status in database
2. Payment verification endpoint returns success
3. Client refreshes page (`window.location.reload()`)
4. All instances of the invoice show updated status:
   - Invoice History table (Project Page)
   - Invoice History table (Billing Page)
   - Invoice Details dialog

## Styling & Theming

### Color Scheme
- **Emerald**: Tonnage billing, primary actions
- **Blue**: Change order billing, secondary actions
- **Gray**: Neutral information, backgrounds
- **Amber**: Payment pending indicators

### Gradients
- Header: `from-emerald-50 to-blue-50`
- Total section: `from-emerald-50 to-blue-50`
- Dark mode variants included

### Spacing
- Consistent padding: `px-6 py-4` for sections
- Gap between elements: `gap-4` or `gap-6`
- Rounded corners: `rounded-lg` or `rounded-xl`

## Future Enhancements

### Planned Features
1. **PDF Generation**: Actual PDF download functionality
2. **Email Invoice**: Send invoice via email
3. **Payment History**: View all payments for an invoice
4. **Partial Payments**: Support for partial payment amounts
5. **Payment Methods**: Multiple payment gateway options
6. **Receipt Download**: Download payment receipt
7. **Invoice Notes**: Add notes or comments to invoices
8. **Dispute Resolution**: Flag and resolve invoice disputes

### Potential Improvements
1. **Offline Support**: Cache invoice details for offline viewing
2. **Bulk Actions**: Pay multiple invoices at once
3. **Scheduled Payments**: Set up automatic payments
4. **Payment Reminders**: Email/SMS reminders for due invoices
5. **Invoice Templates**: Customizable invoice layouts
6. **Multi-Currency**: Support for different currencies
7. **Tax Calculations**: Automatic tax computation
8. **Discount Codes**: Apply promotional discounts

## Testing Checklist

### Functional Testing
- [ ] Click row in Project Page Invoice History table
- [ ] Click row in Billing Page Invoice History table
- [ ] Click View Details button in Actions column
- [ ] Verify all invoice details display correctly
- [ ] Test Pay Now button for unpaid invoices
- [ ] Verify Pay Now button hidden for paid invoices
- [ ] Test print functionality
- [ ] Test close button
- [ ] Verify payment flow completes successfully
- [ ] Confirm status updates after payment

### Responsive Testing
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify dialog fits within viewport
- [ ] Check scrolling behavior
- [ ] Verify button layouts on small screens

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] ARIA labels

### Performance Testing
- [ ] Dialog opens quickly (<200ms)
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Payment gateway loads efficiently

## Troubleshooting

### Common Issues

#### Dialog Not Opening
- Check if `onRowClick` is passed to `SectionTableCard`
- Verify `handleViewInvoiceDetails` is defined
- Ensure state is updating correctly

#### Pay Now Button Not Working
- Verify Razorpay API key is configured
- Check browser console for errors
- Ensure invoice has correct status
- Verify network connectivity

#### Status Not Updating
- Check payment verification endpoint
- Verify database update is successful
- Ensure page refresh occurs after payment
- Check for caching issues

#### Styling Issues
- Clear browser cache
- Check for CSS conflicts
- Verify Tailwind classes are correct
- Test in different browsers

## Support

For issues or questions:
1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Contact development team

---

**Last Updated**: December 26, 2025
**Version**: 1.0.0
**Maintained By**: Development Team
