import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility function to capture a hidden or visible HTML element
 * and trigger a high-resolution PDF download using html2canvas & jsPDF.
 */
export const downloadElementAsPDF = async (
  element: HTMLElement,
  fileName: string
): Promise<void> => {
  if (!element) return;

  // Save original style properties to restore after rendering
  const originalDisplay = element.style.display;
  const originalPosition = element.style.position;
  const originalVisibility = element.style.visibility;
  const originalTop = element.style.top;
  const originalLeft = element.style.left;

  try {
    // Force element into DOM rendering view temporarily for html2canvas
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.visibility = 'visible';
    element.style.top = '-9999px';
    element.style.left = '0px';

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution retina scale
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: 800
    });

    const imgData = canvas.toDataURL('image/png');

    // Standard A4 portrait PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // Get total pages based on canvas aspect ratio
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  } catch (err) {
    console.error('Failed to generate PDF document:', err);
    throw err;
  } finally {
    // Restore element style
    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.visibility = originalVisibility;
    element.style.top = originalTop;
    element.style.left = originalLeft;
  }
};
