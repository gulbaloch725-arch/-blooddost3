import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const generateCertificate = async (donorName: string, date: string, ngoName: string, bloodGroup: string, options?: { certificateId?: string, logo?: string, stamp?: string, systemLogo?: string | null }) => {
  console.log('Starting certificate generation for:', donorName);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const certId = options?.certificateId || `BD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getTime().toString().slice(-4)}`;

  // --- Colors ---
  const BrandRed = [183, 28, 28]; // #B71C1C
  const Gold = [212, 175, 55]; // #d4af37
  const DarkGray = [55, 65, 81];
  const LightGray = [229, 231, 235];

  console.log('PDF initialized');

  // --- Background ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // --- Border & Corners ---
  // Outer Border
  doc.setDrawColor(Gold[0], Gold[1], Gold[2]);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, width - 10, height - 10, 'D');

  // Top Left Red Fold
  doc.saveGraphicsState();
  doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.triangle(5, 5, 45, 5, 5, 45, 'F');
  doc.setDrawColor(Gold[0], Gold[1], Gold[2]);
  doc.setLineWidth(1);
  doc.line(5, 45, 45, 5);
  doc.restoreGraphicsState();

  // Bottom Right Red Fold (Mirrored)
  doc.saveGraphicsState();
  doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.triangle(width - 5, height - 5, width - 45, height - 5, width - 5, height - 45, 'F');
  doc.setDrawColor(Gold[0], Gold[1], Gold[2]);
  doc.setLineWidth(1);
  doc.line(width - 45, height - 5, width - 5, height - 45);
  doc.restoreGraphicsState();

  // Ornate Pattern (Top Right & Bottom Left)
  const drawPattern = (x: number, y: number, r: number) => {
    doc.saveGraphicsState();
    doc.setDrawColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
    doc.setLineWidth(0.2);
    const s = 30;
    const step = 4;
    for (let i = 0; i <= s; i += step) {
      if (r === 0) { // Top Right
        doc.line(x - i, y, x, y + i);
        doc.line(x - s + i, y, x, y + s - i);
      } else { // Bottom Left
        doc.line(x + i, y, x, y - i);
        doc.line(x + s - i, y, x, y - s + i);
      }
    }
    doc.restoreGraphicsState();
  };
  drawPattern(width - 10, 10, 0);
  drawPattern(10, height - 10, 1);

  // --- Gold Seal (Top Right) ---
  const sealX = width - 45;
  const sealY = 45;
  doc.saveGraphicsState();
  // Ribbons
  doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.triangle(sealX - 8, sealY + 5, sealX - 4, sealY + 25, sealX, sealY + 5, 'F');
  doc.triangle(sealX + 8, sealY + 5, sealX + 4, sealY + 25, sealX, sealY + 5, 'F');
  // Gold Circle
  doc.setFillColor(Gold[0], Gold[1], Gold[2]);
  doc.circle(sealX, sealY, 12, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.circle(sealX, sealY, 10, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(0, 0, 0);
  doc.text('BE A HERO', sealX, sealY - 4, { align: 'center' });
  doc.setFontSize(7);
  doc.text('DONATE', sealX, sealY + 0.5, { align: 'center' });
  doc.text('BLOOD', sealX, sealY + 4, { align: 'center' });
  doc.restoreGraphicsState();

  // --- Background Icon (Helping Hands/Blood Drop - Subtle) ---
  doc.saveGraphicsState();
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
  doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  const centerX = width / 2;
  const centerY = height / 2 + 10;
  // Simple hands representation
  doc.ellipse(centerX - 12, centerY + 5, 10, 4, 'F');
  doc.ellipse(centerX + 12, centerY + 5, 10, 4, 'F');
  doc.circle(centerX, centerY - 5, 8, 'F');
  doc.restoreGraphicsState();

  // --- Heartbeat lines (Improved with Heart Icons) ---
  const drawECG = (x: number, y: number, w: number, alignRight = false) => {
    doc.setDrawColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    doc.setLineWidth(0.4);
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.4 }));
    
    // Calculate path relative to x
    doc.moveTo(x, y);
    doc.lineTo(x + w * 0.2, y);
    doc.lineTo(x + w * 0.25, y - 5);
    doc.lineTo(x + w * 0.3, y + 8);
    doc.lineTo(x + w * 0.4, y - 12);
    doc.lineTo(x + w * 0.45, y + 4);
    doc.lineTo(x + w * 0.5, y);
    doc.lineTo(x + w * 0.7, y);
    doc.stroke();

    // Small Heart at the end of heartbeat
    const hx = alignRight ? x + 5 : x + w * 0.75;
    const hy = y;
    doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    // Simple heart shape
    doc.circle(hx - 1, hy - 1, 1, 'F');
    doc.circle(hx + 1, hy - 1, 1, 'F');
    doc.triangle(hx - 2, hy - 0.5, hx + 2, hy - 0.5, hx, hy + 2, 'F');

    doc.restoreGraphicsState();
  };
  drawECG(15, 80, 40);
  drawECG(width - 55, 80, 40, true);

  // --- TOP SECTION: NGO Branding ---
  if (options?.logo && options.logo.startsWith('data:image')) {
    try {
      doc.addImage(options.logo, 'JPEG', width / 2 - 12, 12, 24, 24, undefined, 'FAST');
    } catch (e) {
      console.warn('NGO Logo add failed:', e);
    }
  } else {
    // Medical Cross Logo placeholder
    doc.setDrawColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    doc.setLineWidth(1);
    doc.line(width / 2, 12, width / 2, 24);
    doc.line(width / 2 - 6, 18, width / 2 + 6, 18);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.text(ngoName.toUpperCase(), width / 2, 42, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(DarkGray[0], DarkGray[1], DarkGray[2]);
  doc.text('Connecting Lives, Saving Humanity', width / 2, 48, { align: 'center' });

  // --- MAIN TITLE ---
  doc.saveGraphicsState();
  doc.setFont('times', 'bold');
  doc.setFontSize(44);
  doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.text('CERTIFICATE', width / 2, 72, { align: 'center' });

  // Ornate lines around "OF APPRECIATION"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  const subtitle = 'OF APPRECIATION';
  const subW = doc.getTextWidth(subtitle);
  const lineY = 82;
  doc.text(subtitle, width / 2, lineY, { align: 'center' });
  
  doc.setDrawColor(Gold[0], Gold[1], Gold[2]);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - subW/2 - 20, lineY - 1.5, width / 2 - subW/2 - 5, lineY - 1.5);
  doc.line(width / 2 + subW/2 + 5, lineY - 1.5, width / 2 + subW/2 + 20, lineY - 1.5);
  doc.circle(width / 2 - subW/2 - 21.5, lineY - 1.5, 0.8, 'F');
  doc.circle(width / 2 + subW/2 + 21.5, lineY - 1.5, 0.8, 'F');
  doc.restoreGraphicsState();

  // --- BODY TEXT ---
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(DarkGray[0], DarkGray[1], DarkGray[2]);
  doc.text('This certificate is proudly presented to', width / 2, 95, { align: 'center' });

  // Donor Name (Calligraphy)
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(54);
  doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.text(donorName, width / 2, 115, { align: 'center' });

  // Decorative Underline with cross
  const nameW = doc.getTextWidth(donorName);
  doc.setDrawColor(Gold[0], Gold[1], Gold[2]);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - nameW / 2 - 10, 118, width / 2 + nameW / 2 + 10, 118);
  doc.setFillColor(Gold[0], Gold[1], Gold[2]);
  doc.rect(width / 2 - 2, 117, 4, 2, 'F');
  doc.rect(width / 2 - 1, 116, 2, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(DarkGray[0], DarkGray[1], DarkGray[2]);
  doc.text('in recognition of your noble contribution and life-saving blood donation.', width / 2, 128, { align: 'center' });
  doc.text('Your generosity has helped save precious lives and inspired humanity.', width / 2, 134, { align: 'center' });

  // --- INFO BAR: Data Row ---
  const barY = 145;
  const barH = 22;
  const barW = width - 40;
  const barX = 20;

  doc.setDrawColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(barX, barY, barW, barH, 3, 3, 'D');

  const stepX = barW / 5;
  const drawInfoSection = (i: number, label: string, value: string) => {
    const sectionX = barX + (i * stepX);
    if (i > 0) {
      doc.line(sectionX, barY + 4, sectionX, barY + barH - 4);
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    doc.text(label.toUpperCase(), sectionX + stepX / 2, barY + 8, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(value, sectionX + stepX / 2, barY + 16, { align: 'center' });
  };

  drawInfoSection(0, 'Blood Group', bloodGroup);
  drawInfoSection(1, 'Donation Date', date);
  drawInfoSection(2, 'Location', 'Blood Center');
  drawInfoSection(3, 'Certificate ID', certId);

  // QR in the last section
  try {
    const qrDataUrl = await QRCode.toDataURL(`https://blooddost.pk/verify/${certId}`);
    doc.addImage(qrDataUrl, 'PNG', barX + (4 * stepX) + 5, barY + 2, 18, 18);
    doc.setFontSize(6);
    doc.text('SCAN TO VERIFY', barX + (4 * stepX) + 33, barY + 11, { align: 'center' });
  } catch (e) {}

  // --- BOTTOM SECTION: Signatures ---
  const sigY = 182;
  
  // Left: NGO Representative
  if (options?.stamp && options.stamp.startsWith('data:image')) {
    try {
      doc.addImage(options.stamp, 'PNG', barX + 15, sigY - 18, 30, 18, undefined, 'FAST');
    } catch (e) {}
  }
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(barX + 5, sigY, barX + 55, sigY);
  doc.setFontSize(9);
  doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.text('NGO REPRESENTATIVE', barX + 30, sigY + 5, { align: 'center' });

  // Center: Blood Dost Branding
  if (options?.systemLogo && options.systemLogo.startsWith('data:image')) {
    try {
      doc.addImage(options.systemLogo, 'JPEG', width / 2 - 12, 172, 24, 24, undefined, 'FAST');
    } catch (e) {
      console.warn('System Logo error:', e);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(BrandRed[0], BrandRed[1], BrandRed[2]);
    doc.text('BLOOD DOST', width / 2, 185, { align: 'center' });
  }

  // Right: Project Director
  doc.line(width - barX - 55, sigY, width - barX - 5, sigY);
  doc.text('PROJECT DIRECTOR', width - barX - 30, sigY + 5, { align: 'center' });

  // --- FOOTER BAR ---
  const footY = height - 12;
  doc.setFillColor(BrandRed[0], BrandRed[1], BrandRed[2]);
  doc.rect(20, footY, width - 40, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('www.blooddost.pk  |  Find us on Social Media @blooddost  |  Thank you for being a life saver.', width / 2, footY + 5, { align: 'center' });


  console.log('Finalizing PDF...');
  const fileName = `BloodDost_Award_${donorName.replace(/\s+/g, '_')}.pdf`;
  
  try {
    doc.save(fileName);
  } catch (saveError) {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};


export const shareOnWhatsApp = (donorName: string, donationCount?: number, badgeName?: string) => {
  let message = `I am proud to be a Life Saver at Blood Dost! 🩸 Digitalizing life-saving response in Pakistan. Join us: www.blooddost.pk`;
  
  if (donationCount && donationCount > 0) {
    message = `I have saved lives by donating blood ${donationCount} times ${badgeName ? `and earned the '${badgeName}' badge ` : ''}on Blood Dost! 🩸 Help me save more lives. Register now: www.blooddost.pk`;
  }
  
  const text = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

export const shareOnFacebook = (donorName: string) => {
  const url = encodeURIComponent('https://www.blooddost.pk');
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
};

export const shareProfile = async (donorName: string, donationCount: number, badgeName: string) => {
  const text = `I've donated blood ${donationCount} times and earned the ${badgeName} badge on Blood Dost! 🩸 Join me in saving lives.`;
  const url = 'https://www.blooddost.pk';

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Blood Donation Journey',
        text: text,
        url: url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  } else {
    shareOnWhatsApp(donorName, donationCount, badgeName);
  }
};
