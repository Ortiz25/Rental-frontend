import React from 'react';
import { X, Download, Send } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { formatCurrency } from '../../utils/helperFunctions';


// PDF Document Component
const InvoicePDF = ({ payment, rentAmount, utilitiesAmount, lateFee, totalDue, amountPaid, balanceDue }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 11,
      fontFamily: 'Helvetica',
    },
    companyHeader: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 2,
      borderBottomColor: '#2563eb',
    },
    companyName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#2563eb',
      marginBottom: 4,
    },
    companyTagline: {
      fontSize: 10,
      color: '#6b7280',
      fontStyle: 'italic',
    },
    documentType: {
      fontSize: 28,
      textAlign: 'center',
      marginBottom: 5,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    invoiceNumber: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 20,
      color: '#6b7280',
    },
    paidBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: 8,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 15,
      borderRadius: 4,
    },
    section: {
      marginBottom: 15,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    column: {
      width: '48%',
    },
    columnRight: {
      width: '48%',
      alignItems: 'flex-end',
    },
    label: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    text: {
      fontSize: 11,
      marginBottom: 4,
    },
    textBold: {
      fontSize: 11,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    textGray: {
      fontSize: 11,
      color: '#6b7280',
      marginBottom: 4,
    },
    textGreen: {
      fontSize: 11,
      color: '#059669',
      fontWeight: 'bold',
    },
    textRed: {
      fontSize: 11,
      color: '#dc2626',
      fontWeight: 'bold',
    },
    textYellow: {
      fontSize: 11,
      color: '#d97706',
      fontWeight: 'bold',
    },
    table: {
      marginBottom: 15,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: '#d1d5db',
      paddingBottom: 8,
      marginBottom: 8,
    },
    tableHeaderCell: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    tableHeaderCellRight: {
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'right',
      flex: 1,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingVertical: 10,
    },
    tableCell: {
      fontSize: 11,
      flex: 2,
    },
    tableCellRight: {
      fontSize: 11,
      textAlign: 'right',
      flex: 1,
      fontWeight: 'bold',
    },
    utilityBox: {
      backgroundColor: '#eff6ff',
      padding: 10,
      borderRadius: 4,
      marginVertical: 8,
    },
    utilityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#1e40af',
    },
    utilityItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 15,
      marginBottom: 4,
      fontSize: 10,
    },
    summarySection: {
      borderTopWidth: 2,
      borderTopColor: '#d1d5db',
      paddingTop: 15,
      marginTop: 15,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 8,
    },
    summaryLabel: {
      width: 150,
      fontSize: 11,
    },
    summaryValue: {
      width: 100,
      textAlign: 'right',
      fontSize: 11,
    },
    summaryTotal: {
      fontSize: 13,
      fontWeight: 'bold',
      borderTopWidth: 1,
      borderTopColor: '#d1d5db',
      paddingTop: 8,
    },
    paymentInfoBox: {
      backgroundColor: '#f9fafb',
      padding: 12,
      borderRadius: 4,
      marginBottom: 15,
    },
    footer: {
      textAlign: 'center',
      fontSize: 10,
      color: '#6b7280',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingTop: 15,
      marginTop: 20,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Header */}
        <View style={styles.companyHeader}>
          <Text style={styles.companyName}>Property Management Solutions</Text>
          <Text style={styles.companyTagline}>Your Trusted Property Partner</Text>
        </View>

        {/* Document Type Header */}
        <Text style={styles.documentType}>
          {payment.payment_status === "paid" ? "RECEIPT" : "INVOICE"}
        </Text>
        <Text style={styles.invoiceNumber}>
          #{payment.invoice_number || `INV-${payment.id}`}
        </Text>

        {/* Paid Badge */}
        {payment.payment_status === "paid" && (
          <View style={styles.paidBadge}>
            <Text>✓ PAID IN FULL</Text>
          </View>
        )}

        {/* Property and Payment Details */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Property Information</Text>
            <Text style={styles.textBold}>{payment.property_unit}</Text>
            <Text style={styles.textGray}>Tenant: {payment.tenant_name}</Text>
            <Text style={styles.textGray}>Lease: {payment.lease_number}</Text>
          </View>
          <View style={styles.columnRight}>
            <Text style={styles.label}>
              {payment.payment_status === "paid" ? "Receipt" : "Payment"} Details
            </Text>
            <Text style={styles.textGray}>Issue Date: {formatDate(payment.original_due_date || payment.due_date)}</Text>
            {payment.payment_status !== "paid" && (
              <Text style={styles.textGray}>Due Date: {formatDate(payment.due_date)}</Text>
            )}
            {payment.payment_date && (
              <Text style={styles.textGray}>
                {payment.payment_status === "paid" ? "Payment" : "Paid"} Date: {formatDate(payment.payment_date)}
              </Text>
            )}
            <Text style={
              payment.payment_status === 'paid' ? styles.textGreen : 
              payment.payment_status === 'overdue' ? styles.textRed : styles.textYellow
            }>
              Status: {payment.payment_status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Invoice Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
            <Text style={styles.tableHeaderCellRight}>Amount</Text>
          </View>

          {/* Rent */}
          <View style={styles.tableRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.textBold}>Monthly Rent</Text>
              <Text style={styles.textGray}>Period: {formatDate(payment.due_date)}</Text>
            </View>
            <Text style={styles.tableCellRight}>{formatCurrency(rentAmount)}</Text>
          </View>

          {/* Utilities */}
          {utilitiesAmount > 0 && payment.utility_breakdown && (
            <View style={styles.tableRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.utilityBox}>
                  <View style={styles.utilityHeader}>
                    <Text>Utility Charges</Text>
                    <Text>{formatCurrency(utilitiesAmount)}</Text>
                  </View>
                  {payment.utility_breakdown.water_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Water</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.water_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.electricity_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Electricity</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.electricity_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.gas_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Gas</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.gas_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.service_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Service Charges</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.service_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.garbage_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Garbage Collection</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.garbage_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.common_area_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Common Area Charges</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.common_area_charges)}</Text>
                    </View>
                  )}
                  {payment.utility_breakdown.other_charges > 0 && (
                    <View style={styles.utilityItem}>
                      <Text>• Other ({payment.utility_breakdown.other_charges_description || 'Misc'})</Text>
                      <Text>{formatCurrency(payment.utility_breakdown.other_charges)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Late Fee */}
          {lateFee > 0 && (
            <View style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.textRed}>Late Fee</Text>
                <Text style={styles.textGray}>Applied for overdue payment</Text>
              </View>
              <Text style={[styles.tableCellRight, { color: '#dc2626' }]}>{formatCurrency(lateFee)}</Text>
            </View>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rent:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(rentAmount)}</Text>
          </View>

          {utilitiesAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#2563eb' }]}>Utilities:</Text>
              <Text style={[styles.summaryValue, { color: '#2563eb' }]}>{formatCurrency(utilitiesAmount)}</Text>
            </View>
          )}

          {lateFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#dc2626' }]}>Late Fee:</Text>
              <Text style={[styles.summaryValue, { color: '#dc2626' }]}>{formatCurrency(lateFee)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.summaryTotal]}>Total Due:</Text>
            <Text style={[styles.summaryValue, styles.summaryTotal]}>{formatCurrency(totalDue)}</Text>
          </View>

          {amountPaid > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#059669' }]}>Amount Paid:</Text>
                <Text style={[styles.summaryValue, { color: '#059669' }]}>{formatCurrency(amountPaid)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.summaryTotal]}>Balance Due:</Text>
                <Text style={[styles.summaryValue, styles.summaryTotal, { color: balanceDue > 0 ? '#dc2626' : '#059669' }]}>
                  {formatCurrency(balanceDue)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Information */}
        {payment.payment_method && (
          <View style={styles.paymentInfoBox}>
            <Text style={styles.textBold}>Payment Information</Text>
            <Text style={styles.text}>Method: {payment.payment_method}</Text>
            {payment.payment_reference && (
              <Text style={styles.text}>Reference: {payment.payment_reference}</Text>
            )}
            {payment.payment_date && (
              <Text style={styles.text}>Date: {formatDate(payment.payment_date)}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Property Management Solutions</Text>
          <Text>Thank you for your business!</Text>
          <Text>For questions about this {payment.payment_status === "paid" ? "receipt" : "invoice"}, please contact our office.</Text>
          <Text style={{ fontSize: 9, marginTop: 8 }}>Email: info@propertymgmt.com | Phone: (555) 123-4567</Text>
        </View>
      </Page>
    </Document>
  );
};

const InvoiceModal = ({ payment, isOpen, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownloadPDF = async () => {
    try {
      // Calculate totals
      const rentAmount = parseFloat(payment.amount_due) || 0;
      const utilitiesAmount = parseFloat(payment.utilities_charges) || 0;
      const lateFee = parseFloat(payment.late_fee) || 0;
      const totalDue = rentAmount + utilitiesAmount + lateFee;
      const amountPaid = parseFloat(payment.amount_paid) || 0;
      const balanceDue = totalDue - amountPaid;

      // Generate PDF
      const blob = await pdf(
        <InvoicePDF 
          payment={payment}
          rentAmount={rentAmount}
          utilitiesAmount={utilitiesAmount}
          lateFee={lateFee}
          totalDue={totalDue}
          amountPaid={amountPaid}
          balanceDue={balanceDue}
        />
      ).toBlob();

      // Download PDF
      const fileName = `Invoice_${payment.invoice_number || payment.id}_${payment.tenant_name?.replace(/\s+/g, '_')}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !payment) return null;

  // Calculate totals
  const rentAmount = parseFloat(payment.amount_due) || 0;
  const utilitiesAmount = parseFloat(payment.utilities_charges) || 0;
  const lateFee = parseFloat(payment.late_fee) || 0;
  const totalDue = rentAmount + utilitiesAmount + lateFee;
  const amountPaid = parseFloat(payment.amount_paid) || 0;
  const balanceDue = totalDue - amountPaid;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-2/3 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            Invoice #{payment.invoice_number || `INV-${payment.id}`}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Content */}
        <div className="p-6 bg-white">
          {/* Company Header */}
          <div className="mb-6 pb-4 border-b-2 border-blue-600">
            <h1 className="text-2xl font-bold text-blue-600 mb-1">Property Management Solutions</h1>
            <p className="text-sm text-gray-600 italic">Your Trusted Property Partner</p>
          </div>

          {/* Document Type Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {payment.payment_status === "paid" ? "RECEIPT" : "INVOICE"}
            </h1>
            <p className="text-gray-600">#{payment.invoice_number || `INV-${payment.id}`}</p>
          </div>

          {/* Paid Badge */}
          {payment.payment_status === "paid" && (
            <div className="bg-green-100 text-green-800 p-3 rounded text-center font-bold mb-6">
              ✓ PAID IN FULL
            </div>
          )}

          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2 text-lg text-gray-800">Property Information</h3>
              <p className="font-medium">{payment.property_unit}</p>
              <p className="text-gray-600">Tenant: {payment.tenant_name}</p>
              <p className="text-gray-600">Lease: {payment.lease_number}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2 text-lg text-gray-800">
                {payment.payment_status === "paid" ? "Receipt" : "Payment"} Details
              </h3>
              <div className="space-y-1">
                <p><span className="text-gray-600">Issue Date:</span> {formatDate(payment.original_due_date || payment.due_date)}</p>
                {payment.payment_status !== "paid" && (
                  <p><span className="text-gray-600">Due Date:</span> {formatDate(payment.due_date)}</p>
                )}
                {payment.payment_date && (
                  <p><span className="text-gray-600">{payment.payment_status === "paid" ? "Payment" : "Paid"} Date:</span> {formatDate(payment.payment_date)}</p>
                )}
                <p className={`font-semibold ${
                  payment.payment_status === 'paid' ? 'text-green-600' : 
                  payment.payment_status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Status: {payment.payment_status.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2">Description</th>
                  <th className="text-right py-3 px-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium">Monthly Rent</p>
                      <p className="text-sm text-gray-600">
                        Period: {formatDate(payment.due_date)}
                      </p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">
                    {formatCurrency(rentAmount)}
                  </td>
                </tr>
                
                {utilitiesAmount > 0 && payment.utility_breakdown && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-2" colSpan="2">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="flex justify-between font-semibold mb-2 text-blue-900">
                          <span>Utility Charges</span>
                          <span>{formatCurrency(utilitiesAmount)}</span>
                        </div>
                        <div className="ml-4 space-y-1 text-sm text-gray-700">
                          {payment.utility_breakdown.water_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Water</span>
                              <span>{formatCurrency(payment.utility_breakdown.water_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.electricity_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Electricity</span>
                              <span>{formatCurrency(payment.utility_breakdown.electricity_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.gas_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Gas</span>
                              <span>{formatCurrency(payment.utility_breakdown.gas_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.service_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Service Charges</span>
                              <span>{formatCurrency(payment.utility_breakdown.service_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.garbage_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Garbage Collection</span>
                              <span>{formatCurrency(payment.utility_breakdown.garbage_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.common_area_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Common Area Charges</span>
                              <span>{formatCurrency(payment.utility_breakdown.common_area_charges)}</span>
                            </div>
                          )}
                          {payment.utility_breakdown.other_charges > 0 && (
                            <div className="flex justify-between">
                              <span>• Other ({payment.utility_breakdown.other_charges_description || 'Misc'})</span>
                              <span>{formatCurrency(payment.utility_breakdown.other_charges)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {lateFee > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-red-600">Late Fee</p>
                        <p className="text-sm text-gray-600">
                          Applied for overdue payment
                        </p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-medium text-red-600">
                      {formatCurrency(lateFee)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Summary */}
          <div className="border-t-2 border-gray-300 pt-4 mb-8">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Rent:</span>
                  <span>{formatCurrency(rentAmount)}</span>
                </div>
                
                {utilitiesAmount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Utilities:</span>
                    <span>{formatCurrency(utilitiesAmount)}</span>
                  </div>
                )}
                
                {lateFee > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Late Fee:</span>
                    <span>{formatCurrency(lateFee)}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Due:</span>
                  <span>{formatCurrency(totalDue)}</span>
                </div>
                
                {amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(amountPaid)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Balance Due:</span>
                      <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(balanceDue)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {payment.payment_method && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Method:</span> {payment.payment_method}
                </div>
                {payment.payment_reference && (
                  <div>
                    <span className="text-gray-600">Reference:</span> {payment.payment_reference}
                  </div>
                )}
                {payment.payment_date && (
                  <div>
                    <span className="text-gray-600">Date:</span> {formatDate(payment.payment_date)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t pt-4">
            <p className="font-semibold mb-2">Property Management Solutions</p>
            <p>Thank you for your business!</p>
            <p>For questions about this {payment.payment_status === "paid" ? "receipt" : "invoice"}, please contact our office.</p>
            <p className="mt-2 text-xs">Email: info@propertymgmt.com | Phone: (555) 123-4567</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6 pt-6 border-t px-6 pb-6">
          <button 
            onClick={handleDownloadPDF}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          <button 
            onClick={() => alert('Email functionality would be implemented here')}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;