import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ChangeOrderRow = {
  id: string;
  changeOrderId: string;
  description: string;
  hours: number;
  date: string;
  status: string;
};

/**
 * Export a single change order to PDF with company logo and professional formatting
 */
export async function exportChangeOrderToPDF(
  changeOrder: ChangeOrderRow,
  logoPath?: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Add logo if available
  if (logoPath) {
    try {
      // Load logo image
      const img = new Image();
      img.src = logoPath;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Add logo (top left, 40mm width, auto height)
      const logoWidth = 40;
      const logoHeight = (img.height / img.width) * logoWidth;
      doc.addImage(img, "PNG", 14, yPosition, logoWidth, logoHeight);
      yPosition += logoHeight + 10;
    } catch (error) {
      console.warn("Could not load logo:", error);
      // Continue without logo
    }
  }

  // Company Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 118, 110); // Emerald-600
  doc.text("CHANGE ORDER", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  // Divider line
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, pageWidth - 14, yPosition);
  yPosition += 10;

  // Change Order Details Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Change Order Details", 14, yPosition);
  yPosition += 8;

  // Details table
  const detailsData = [
    ["CO #", changeOrder.changeOrderId],
    ["Submitted Date", new Date(changeOrder.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })],
    ["Drawing No", changeOrder.description],
    ["Hours", changeOrder.hours.toFixed(1)],
    ["Status", changeOrder.status],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: detailsData,
    theme: "grid",
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        fillColor: [243, 244, 246], // Gray-100
        textColor: [0, 0, 0],
        cellWidth: 50,
      },
      1: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
      },
    },
    margin: { left: 14, right: 14 },
  });

  // Get final Y position after table
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Status Badge Visual
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  // Status color coding
  let statusColor: [number, number, number] = [107, 114, 128]; // Gray
  if (changeOrder.status.toLowerCase().includes("approved")) {
    statusColor = [34, 197, 94]; // Green
  } else if (changeOrder.status.toLowerCase().includes("pending")) {
    statusColor = [234, 179, 8]; // Yellow
  } else if (changeOrder.status.toLowerCase().includes("review")) {
    statusColor = [59, 130, 246]; // Blue
  } else if (changeOrder.status.toLowerCase().includes("rejected")) {
    statusColor = [239, 68, 68]; // Red
  }

  doc.setTextColor(...statusColor);
  doc.text(`Status: ${changeOrder.status}`, 14, yPosition);
  yPosition += 10;

  // Footer
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128); // Gray-500
  
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  doc.text(`Generated: ${generatedDate}`, 14, footerY);
  doc.text("Page 1 of 1", pageWidth - 14, footerY, { align: "right" });

  // Divider line above footer
  doc.setDrawColor(229, 231, 235); // Gray-200
  doc.setLineWidth(0.3);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  // Save PDF
  doc.save(`change-order-${changeOrder.changeOrderId}.pdf`);
}

/**
 * Export a single change order to CSV format
 */
export function exportChangeOrderToCSV(changeOrder: ChangeOrderRow): void {
  const csvData = [
    ["Field", "Value"],
    ["CO #", changeOrder.changeOrderId],
    [
      "Submitted Date",
      new Date(changeOrder.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ],
    ["Drawing No", changeOrder.description],
    ["Hours", changeOrder.hours.toFixed(1)],
    ["Status", changeOrder.status],
  ];

  // Convert to CSV string
  const csv = csvData
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    )
    .join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `change-order-${changeOrder.changeOrderId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print a change order (opens print dialog after generating PDF preview)
 */
export async function printChangeOrder(
  changeOrder: ChangeOrderRow,
  logoPath?: string
): Promise<void> {
  // Generate PDF and open in new window for printing
  await exportChangeOrderToPDF(changeOrder, logoPath);
  
  // Note: The PDF will be downloaded. For actual printing,
  // you would need to open it in an iframe or new window
  // and call window.print() on that window.
}

