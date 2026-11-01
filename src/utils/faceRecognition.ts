import { Student, BiometricDetection } from '../types';

/**
 * Draws high-tech biometric HUD and facial landmarks on the canvas
 */
export function drawBiometricHUD(
  canvas: HTMLCanvasElement,
  detection: BiometricDetection | null,
  isScanning: boolean
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!isScanning) return;

  // If no face is detected, draw subtle center scanning reticle
  if (!detection || !detection.faceDetected || !detection.boundingBox) {
    // Semi-transparent center frame guide
    const guideW = w * 0.45;
    const guideH = h * 0.6;
    const guideX = (w - guideW) / 2;
    const guideY = (h - guideH) / 2;

    ctx.save();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(guideX, guideY, guideW, guideH);
    ctx.setLineDash([]);

    // Corner guides
    const corner = 24;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(guideX, guideY + corner);
    ctx.lineTo(guideX, guideY);
    ctx.lineTo(guideX + corner, guideY);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(guideX + guideW - corner, guideY);
    ctx.lineTo(guideX + guideW, guideY);
    ctx.lineTo(guideX + guideW, guideY + corner);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(guideX, guideY + guideH - corner);
    ctx.lineTo(guideX, guideY + guideH);
    ctx.lineTo(guideX + corner, guideY + guideH);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(guideX + guideW - corner, guideY + guideH);
    ctx.lineTo(guideX + guideW, guideY + guideH);
    ctx.lineTo(guideX + guideW, guideY + guideH - corner);
    ctx.stroke();

    ctx.restore();
    return;
  }

  const { x, y, width, height } = detection.boundingBox;

  ctx.save();

  // Color selection based on match status
  let themeColor = '#10b981'; // Green for verified
  let bgColor = 'rgba(16, 185, 129, 0.12)';

  if (detection.antiSpoofStatus === 'failed') {
    themeColor = '#ef4444'; // Red for spoof
    bgColor = 'rgba(239, 68, 68, 0.15)';
  } else if (!detection.matchedStudent) {
    themeColor = '#f59e0b'; // Amber for unknown
    bgColor = 'rgba(245, 158, 11, 0.12)';
  }

  // Draw face bounding box highlight
  ctx.fillStyle = bgColor;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Reticle brackets on four corners of face
  const len = Math.min(width, height) * 0.22;
  ctx.lineWidth = 3.5;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(x + width - len, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + len);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(x, y + height - len);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + len, y + height);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(x + width - len, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width, y + height - len);
  ctx.stroke();

  // Biometric keypoints / Mesh grid
  if (detection.landmarks && detection.landmarks.length > 0) {
    ctx.fillStyle = themeColor;
    detection.landmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Mesh connecting lines
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 0.75;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (let i = 0; i < detection.landmarks.length - 1; i += 2) {
      ctx.moveTo(detection.landmarks[i].x, detection.landmarks[i].y);
      ctx.lineTo(detection.landmarks[i + 1].x, detection.landmarks[i + 1].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  // Label badge above face
  const labelY = Math.max(28, y - 10);
  const title = detection.antiSpoofStatus === 'failed'
    ? '⚠️ SPOOF ATTACK SUSPECTED'
    : detection.matchedStudent
      ? `✓ ${detection.matchedStudent.name} (${detection.confidence.toFixed(1)}%)`
      : `? UNREGISTERED VISITOR (${detection.confidence.toFixed(1)}%)`;

  ctx.font = '600 13px "JetBrains Mono", monospace';
  const textWidth = ctx.measureText(title).width;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(x, labelY - 22, textWidth + 24, 26, 6);
  ctx.fill();
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = themeColor;
  ctx.fillText(title, x + 12, labelY - 5);

  ctx.restore();
}

/**
 * Generate simulated biometric face landmarks for HUD preview
 */
export function generateLandmarks(x: number, y: number, w: number, h: number) {
  return [
    // Left eye points
    { x: x + w * 0.32, y: y + h * 0.38 },
    { x: x + w * 0.38, y: y + h * 0.36 },
    { x: x + w * 0.44, y: y + h * 0.38 },
    // Right eye points
    { x: x + w * 0.56, y: y + h * 0.38 },
    { x: x + w * 0.62, y: y + h * 0.36 },
    { x: x + w * 0.68, y: y + h * 0.38 },
    // Nose bridge & tip
    { x: x + w * 0.50, y: y + h * 0.44 },
    { x: x + w * 0.50, y: y + h * 0.55 },
    { x: x + w * 0.44, y: y + h * 0.60 },
    { x: x + w * 0.56, y: y + h * 0.60 },
    // Mouth
    { x: x + w * 0.38, y: y + h * 0.74 },
    { x: x + w * 0.50, y: y + h * 0.72 },
    { x: x + w * 0.62, y: y + h * 0.74 },
    { x: x + w * 0.50, y: y + h * 0.80 },
    // Jawline
    { x: x + w * 0.22, y: y + h * 0.52 },
    { x: x + w * 0.28, y: y + h * 0.78 },
    { x: x + w * 0.50, y: y + h * 0.92 },
    { x: x + w * 0.72, y: y + h * 0.78 },
    { x: x + w * 0.78, y: y + h * 0.52 },
  ];
}
