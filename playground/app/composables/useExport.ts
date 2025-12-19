import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useExport = () => {
  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportToPDF = (data: any[], fileName: string, columns: string[]) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const title = fileName.toUpperCase()
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)

    const tableRows = data.map(item => columns.map(col => item[col]))

    autoTable(doc, {
      startY: 30,
      head: [columns.map(col => col.toUpperCase())],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold', lineWidth: 0.1 },
      styles: { fontSize: 9, lineWidth: 0.1 },
    })
    
    doc.save(`${fileName}.pdf`)
  }

  return {
    exportToExcel,
    exportToPDF,
  }
}
