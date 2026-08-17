import JSZip from 'jszip';

/**
 * Maps Excel row indices (0-based OpenXML row index or Excel row number) to base64 Data URLs.
 */
export interface ExtractedImageMap {
  /** Map of 0-based OpenXML row index -> Data URL string (e.g. data:image/png;base64,...) */
  byRow: Map<number, string>;
  /** Total count of images successfully extracted */
  totalExtracted: number;
}

/**
 * Helper to convert binary ArrayBuffer or Uint8Array to Base64 string.
 */
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Determines MIME type from file extension.
 */
const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || 'png';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return `image/${ext}`;
  }
};

/**
 * Parses an uploaded `.xlsx` spreadsheet buffer in memory using JSZip,
 * extracts drawing images anchored to rows (or modern cellImages),
 * and returns a map of row indices to base64 Data URLs.
 * 
 * @param buffer - Raw ArrayBuffer or File binary data of the `.xlsx` document.
 * @returns Promise resolving to ExtractedImageMap.
 */
export const extractExcelImages = async (
  buffer: ArrayBuffer | Uint8Array
): Promise<ExtractedImageMap> => {
  const rowImageMap = new Map<number, string>();
  let totalExtracted = 0;

  try {
    const zip = await JSZip.loadAsync(buffer);
    const parser = new DOMParser();

    // 1. Locate all media files in xl/media/
    const mediaFiles = new Map<string, Uint8Array>();
    const mediaPromises: Promise<void>[] = [];

    zip.folder('xl/media')?.forEach((relativePath, file) => {
      if (!file.dir) {
        mediaPromises.push(
          file.async('uint8array').then(data => {
            const fullPath = `xl/media/${relativePath.toLowerCase()}`;
            const shortPath = `media/${relativePath.toLowerCase()}`;
            mediaFiles.set(fullPath, data);
            mediaFiles.set(shortPath, data);
            mediaFiles.set(relativePath.toLowerCase(), data);
          })
        );
      }
    });

    await Promise.all(mediaPromises);

    if (mediaFiles.size === 0) {
      return { byRow: rowImageMap, totalExtracted: 0 };
    }

    // 2. Process drawings: xl/drawings/drawing*.xml and relationships xl/drawings/_rels/drawing*.xml.rels
    const drawingFiles: string[] = [];
    zip.folder('xl/drawings')?.forEach((relativePath, file) => {
      if (!file.dir && relativePath.endsWith('.xml')) {
        drawingFiles.push(relativePath);
      }
    });

    for (const drawingRelPath of drawingFiles) {
      const drawingXmlFile = zip.file(`xl/drawings/${drawingRelPath}`);
      if (!drawingXmlFile) continue;

      const drawingXmlText = await drawingXmlFile.async('text');
      const drawingDoc = parser.parseFromString(drawingXmlText, 'application/xml');

      // Check relationships file for this drawing e.g. xl/drawings/_rels/drawing1.xml.rels
      const relsFile = zip.file(`xl/drawings/_rels/${drawingRelPath}.rels`);
      const relMap = new Map<string, string>(); // rId -> media file path

      if (relsFile) {
        const relsText = await relsFile.async('text');
        const relsDoc = parser.parseFromString(relsText, 'application/xml');
        const relationships = relsDoc.getElementsByTagName('Relationship');

        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i];
          const id = rel.getAttribute('Id');
          const target = rel.getAttribute('Target');
          if (id && target) {
            const normalizedTarget = target.replace(/^\.\.\//, '').toLowerCase();
            relMap.set(id, normalizedTarget);
          }
        }
      }

      // Query all twoCellAnchor and oneCellAnchor elements
      const anchors = [
        ...Array.from(drawingDoc.getElementsByTagName('xdr:twoCellAnchor')),
        ...Array.from(drawingDoc.getElementsByTagName('twoCellAnchor')),
        ...Array.from(drawingDoc.getElementsByTagName('xdr:oneCellAnchor')),
        ...Array.from(drawingDoc.getElementsByTagName('oneCellAnchor')),
      ];

      for (const anchor of anchors) {
        // Find row index from <from><row>
        const fromElem = anchor.getElementsByTagName('xdr:from')[0] || anchor.getElementsByTagName('from')[0];
        if (!fromElem) continue;

        const rowElem = fromElem.getElementsByTagName('xdr:row')[0] || fromElem.getElementsByTagName('row')[0];
        if (!rowElem || !rowElem.textContent) continue;

        const openXmlRow = parseInt(rowElem.textContent.trim(), 10);
        if (isNaN(openXmlRow)) continue;

        // Find relationship ID (r:embed or embed) inside <a:blip>
        const blipElem = anchor.getElementsByTagName('a:blip')[0] || anchor.getElementsByTagName('blip')[0];
        if (!blipElem) continue;

        const rId = blipElem.getAttribute('r:embed') || blipElem.getAttribute('embed');
        if (!rId) continue;

        const targetMedia = relMap.get(rId);
        if (!targetMedia) continue;

        // Fetch media binary data
        const binaryData = mediaFiles.get(targetMedia) || mediaFiles.get(targetMedia.replace(/^media\//, ''));
        if (binaryData) {
          const mime = getMimeType(targetMedia);
          const base64 = arrayBufferToBase64(binaryData);
          const dataUrl = `data:${mime};base64,${base64}`;

          rowImageMap.set(openXmlRow, dataUrl);
          totalExtracted++;
        }
      }
    }

    // 3. Fallback check for modern Excel xl/cellimages.xml
    const cellImagesXml = zip.file('xl/cellimages.xml');
    if (cellImagesXml) {
      const relsFile = zip.file('xl/cellimages/_rels/cellimages.xml.rels');
      const relMap = new Map<string, string>();

      if (relsFile) {
        const relsText = await relsFile.async('text');
        const relsDoc = parser.parseFromString(relsText, 'application/xml');
        const relationships = relsDoc.getElementsByTagName('Relationship');

        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i];
          const id = rel.getAttribute('Id');
          const target = rel.getAttribute('Target');
          if (id && target) {
            const normalizedTarget = target.replace(/^\.\.\//, '').toLowerCase();
            relMap.set(id, normalizedTarget);
          }
        }
      }

      const cellImagesText = await cellImagesXml.async('text');
      const cellImagesDoc = parser.parseFromString(cellImagesText, 'application/xml');
      const cellImageNodes = Array.from(cellImagesDoc.getElementsByTagName('etc:cellImage'))
        .concat(Array.from(cellImagesDoc.getElementsByTagName('cellImage')));

      cellImageNodes.forEach((node, idx) => {
        const blip = node.getElementsByTagName('a:blip')[0] || node.getElementsByTagName('blip')[0];
        if (!blip) return;

        const rId = blip.getAttribute('r:embed') || blip.getAttribute('embed');
        if (!rId) return;

        const targetMedia = relMap.get(rId);
        if (!targetMedia) return;

        const binaryData = mediaFiles.get(targetMedia) || mediaFiles.get(targetMedia.replace(/^media\//, ''));
        if (binaryData) {
          const mime = getMimeType(targetMedia);
          const base64 = arrayBufferToBase64(binaryData);
          const dataUrl = `data:${mime};base64,${base64}`;

          const fallbackRow = idx + 3;
          if (!rowImageMap.has(fallbackRow)) {
            rowImageMap.set(fallbackRow, dataUrl);
            totalExtracted++;
          }
        }
      });
    }

  } catch (err) {
    console.warn('Excel image extraction notice:', err);
  }

  return {
    byRow: rowImageMap,
    totalExtracted,
  };
};

/**
 * Helper to convert Base64 Data URL to binary Uint8Array bytes.
 */
const dataUrlToUint8Array = (dataUrl: string): { bytes: Uint8Array; ext: string } => {
  const parts = dataUrl.split(',');
  const header = parts[0] || '';
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  
  let ext = 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpeg';
  else if (mime.includes('gif')) ext = 'gif';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('svg')) ext = 'svg';

  const base64Str = parts[1] || parts[0];
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return { bytes, ext };
};

/**
 * Injects binary images and OpenXML drawing relationships natively into an exported `.xlsx` ZIP container.
 * Anchors each question image to Column 3 ("Image") and the row index of the question.
 * 
 * @param xlsxArrayBuffer - The raw ArrayBuffer generated by SheetJS `XLSX.write`.
 * @param questions - Questions array containing optional `image` Data URLs.
 * @returns Promise resolving to a Blob representing the complete `.xlsx` workbook with native drawing images.
 */
export const injectImagesToWorkbookZip = async (
  xlsxArrayBuffer: ArrayBuffer,
  questions: Array<{ image?: string; index: number }>
): Promise<Blob> => {
  try {
    const zip = await JSZip.loadAsync(xlsxArrayBuffer);

    // Filter questions that have valid Base64 data URLs
    const itemsWithImages: Array<{ dataUrl: string; rowIndex: number }> = [];
    questions.forEach((q, idx) => {
      if (q.image && q.image.startsWith('data:image/')) {
        // Row 1 = Header (OpenXML row index 0).
        // Data item 0 = Row 2 (OpenXML row index 1).
        const openXmlRowIndex = idx + 1;
        itemsWithImages.push({ dataUrl: q.image, rowIndex: openXmlRowIndex });
      }
    });

    if (itemsWithImages.length === 0) {
      return new Blob([xlsxArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    }

    // 1. Write binary images to xl/media/
    const drawingRels: string[] = [];
    const drawingAnchors: string[] = [];

    itemsWithImages.forEach((item, i) => {
      const rId = `rId${i + 1}`;
      const { bytes, ext } = dataUrlToUint8Array(item.dataUrl);
      const mediaFileName = `image${i + 1}.${ext}`;

      zip.file(`xl/media/${mediaFileName}`, bytes);

      drawingRels.push(
        `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaFileName}"/>`
      );

      // Col 4 = Column E ("Image")
      drawingAnchors.push(`
    <xdr:twoCellAnchor editAs="oneCell">
      <xdr:from>
        <xdr:col>4</xdr:col>
        <xdr:colOff>15240</xdr:colOff>
        <xdr:row>${item.rowIndex}</xdr:row>
        <xdr:rowOff>15240</xdr:rowOff>
      </xdr:from>
      <xdr:to>
        <xdr:col>5</xdr:col>
        <xdr:colOff>-15240</xdr:colOff>
        <xdr:row>${item.rowIndex + 1}</xdr:row>
        <xdr:rowOff>-15240</xdr:rowOff>
      </xdr:to>
      <xdr:pic>
        <xdr:nvPicPr>
          <xdr:cNvPr id="${i + 1}" name="Picture ${i + 1}"/>
          <xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr>
        </xdr:nvPicPr>
        <xdr:blipFill>
          <a:blip r:embed="${rId}"/>
          <a:stretch><a:fillRect/></a:stretch>
        </xdr:blipFill>
        <xdr:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="1200000" cy="900000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </xdr:spPr>
      </xdr:pic>
      <xdr:clientData/>
    </xdr:twoCellAnchor>`);
    });

    // 2. Write xl/drawings/_rels/drawing1.xml.rels
    const drawingRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${drawingRels.join('\n  ')}
</Relationships>`;
    zip.file('xl/drawings/_rels/drawing1.xml.rels', drawingRelsXml);

    // 3. Write xl/drawings/drawing1.xml
    const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetdrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  ${drawingAnchors.join('\n')}
</xdr:wsDr>`;
    zip.file('xl/drawings/drawing1.xml', drawingXml);

    // 4. Update xl/worksheets/_rels/sheet1.xml.rels
    const sheetRelsFile = zip.file('xl/worksheets/_rels/sheet1.xml.rels');
    let sheetRelsXml = sheetRelsFile ? await sheetRelsFile.async('text') : '';
    if (!sheetRelsXml) {
      sheetRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;
    } else if (!sheetRelsXml.includes('drawing1.xml')) {
      sheetRelsXml = sheetRelsXml.replace(
        '</Relationships>',
        `  <Relationship Id="rIdDrawing1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>\n</Relationships>`
      );
    }
    zip.file('xl/worksheets/_rels/sheet1.xml.rels', sheetRelsXml);

    // 5. Update xl/worksheets/sheet1.xml
    const sheetXmlFile = zip.file('xl/worksheets/sheet1.xml');
    if (sheetXmlFile) {
      let sheetXml = await sheetXmlFile.async('text');
      if (!sheetXml.includes('xmlns:r=')) {
        sheetXml = sheetXml.replace('<worksheet ', '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
      }
      if (!sheetXml.includes('<drawing')) {
        sheetXml = sheetXml.replace(
          '</worksheet>',
          '<drawing r:id="rIdDrawing1"/></worksheet>'
        );
      }
      zip.file('xl/worksheets/sheet1.xml', sheetXml);
    }

    // 6. Update [Content_Types].xml
    const contentTypesFile = zip.file('[Content_Types].xml');
    if (contentTypesFile) {
      let ctXml = await contentTypesFile.async('text');
      if (!ctXml.includes('Extension="png"')) {
        ctXml = ctXml.replace('<Types ', '<Types ><Default Extension="png" ContentType="image/png"/>');
      }
      if (!ctXml.includes('Extension="jpeg"')) {
        ctXml = ctXml.replace('<Types ', '<Types ><Default Extension="jpeg" ContentType="image/jpeg"/>');
      }
      if (!ctXml.includes('/xl/drawings/drawing1.xml')) {
        ctXml = ctXml.replace(
          '</Types>',
          '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>'
        );
      }
      zip.file('[Content_Types].xml', ctXml);
    }

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  } catch (err) {
    console.warn('Native image injection warning:', err);
    return new Blob([xlsxArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
};
