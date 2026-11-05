// Gera o MP4 do vídeo do pop-up a partir de video/popup.html (quadro a quadro, 30 fps).
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';
const FPS = 30, SEG = 11, DIR = 'video/frames';
mkdirSync(DIR, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + process.cwd() + '/video/popup.html');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
const total = FPS * SEG;
for (let i = 0; i < total; i++) {
  await p.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), i * 1000 / FPS);
  await p.screenshot({ path: `${DIR}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
}
await b.close();
execFileSync(ffmpeg, ['-y', '-framerate', String(FPS), '-i', `${DIR}/f%04d.jpg`, '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'video/paraty-waters-popup.tmp.mp4'], { stdio: 'inherit' });
execFileSync('mv', ['video/paraty-waters-popup.tmp.mp4', 'video/paraty-waters-popup.mp4']);
// pôster (primeiro quadro bonito) para o pop-up carregar rápido
execFileSync('cp', [`${DIR}/f${String(FPS * 9).padStart(4, '0')}.jpg`, 'video/paraty-waters-popup.jpg']);
