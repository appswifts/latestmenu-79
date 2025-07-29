import QRCode from 'qrcode';

export const generateQRCodeDataURL = async (url: string): Promise<string> => {
  const qrCodeDataURL = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
  return qrCodeDataURL;
};

export const downloadQRCode = async (url: string, filename: string): Promise<void> => {
  const qrCodeDataURL = await generateQRCodeDataURL(url);
  
  // Create a link element and trigger download
  const link = document.createElement('a');
  link.href = qrCodeDataURL;
  link.download = `${filename}-qr-code.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};