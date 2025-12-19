import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export const useExport = () => {
  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  const exportToPDF = (data: any[], fileName: string, columns: string[]) => {
    const doc = new jsPDF()
    const tableRows = data.map(item => columns.map(col => item[col]))

    /**
     * The leading semicolon is a "defensive semicolon" to prevent errors 
     * when the previous line or this line starts with a parenthesis or bracket.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(doc as any).autoTable({
      head: [columns.map(col => col.toUpperCase())],
      body: tableRows,
    })
    doc.save(`${fileName}.pdf`)
  }

  return {
    exportToExcel,
    exportToPDF,
  }
}
