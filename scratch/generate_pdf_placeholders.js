import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Ensure public directory exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate Player Rules PDF
const docPlayer = new jsPDF('p', 'mm', 'a4');
docPlayer.setFillColor(38, 70, 83); // #264653 dark green background
docPlayer.rect(0, 0, 210, 297, 'F');

docPlayer.setTextColor(233, 196, 106); // #e9c46a gold
docPlayer.setFontSize(22);
docPlayer.text('INQUIZITIVE', 14, 22);

docPlayer.setFontSize(14);
docPlayer.setTextColor(244, 162, 97); // #f4a261
docPlayer.text('Official Competition Guidelines & Stage Mechanics', 14, 30);

docPlayer.setFontSize(10);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('Part 1: General Guidelines & Stage Rounds 1-2', 14, 42);

docPlayer.setDrawColor(42, 157, 143);
docPlayer.setLineWidth(0.5);
docPlayer.line(14, 46, 196, 46);

// Section 1 Box
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 52, 182, 60, 3, 3, 'F');
docPlayer.setTextColor(233, 196, 106);
docPlayer.setFontSize(12);
docPlayer.text('1. General Competition Guidelines', 20, 62);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. The quiz progresses through four stage rounds after qualifying screening.', 20, 70);
docPlayer.text('b. Points reset to zero at the start of new rounds following eliminations.', 20, 76);
docPlayer.text('c. Tie-Breakers will be conducted in case of equal points before elimination.', 20, 82);
docPlayer.text('d. All decisions of the Quiz Master and Organizing team are final and binding.', 20, 88);
docPlayer.text('e. Interruptions will not be entertained once the round starts.', 20, 94);
docPlayer.text('f. Scoreboard tallying will be finalized by the Quiz Master.', 20, 100);

// Section 2 Box
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 120, 182, 50, 3, 3, 'F');
docPlayer.setTextColor(42, 157, 143);
docPlayer.setFontSize(12);
docPlayer.text('2. Round 1: Offline Aptitude Round', 20, 130);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. Format: Written paper-and-pen aptitude evaluation on-site.', 20, 138);
docPlayer.text('b. Advancement: Top-scoring teams qualify to advance to stage tournament.', 20, 144);
docPlayer.text('c. Baseline Reset: Points reset to zero upon entering Round 2.', 20, 150);

// Section 3 Box
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 178, 182, 55, 3, 3, 'F');
docPlayer.setTextColor(244, 162, 97);
docPlayer.setFontSize(12);
docPlayer.text('3. Round 2: Rapid Fire Speed Round & Bonus Points', 20, 188);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. Time Limit: 10 rapid-fire questions against a 60-second countdown clock.', 20, 196);
docPlayer.text('b. Base Scoring: +10 points per correct answer. No negative marking.', 20, 202);
docPlayer.text('c. Accuracy Bonus: +10 bonus for >50% accuracy; +20 bonus for 100% accuracy.', 20, 208);
docPlayer.text('d. Emergency Controls: Quiz Master may pause or inject +5s time buffer.', 20, 214);

docPlayer.setFontSize(8);
docPlayer.setTextColor(244, 162, 97);
docPlayer.text('inQUIZitive - Official Competition Guidelines', 14, 285);
docPlayer.text('Page 1 of 2', 180, 285);

// Add Page 2 for Player Rules
docPlayer.addPage();
docPlayer.setFillColor(38, 70, 83);
docPlayer.rect(0, 0, 210, 297, 'F');

docPlayer.setTextColor(233, 196, 106);
docPlayer.setFontSize(22);
docPlayer.text('INQUIZITIVE', 14, 22);
docPlayer.setFontSize(14);
docPlayer.setTextColor(244, 162, 97);
docPlayer.text('Stage Tournament Mechanics & Sudden-Death Duel', 14, 30);
docPlayer.setDrawColor(42, 157, 143);
docPlayer.line(14, 36, 196, 36);

// Section 4
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 44, 182, 50, 3, 3, 'F');
docPlayer.setTextColor(42, 157, 143);
docPlayer.setFontSize(12);
docPlayer.text('4. Round 3: Jeopardy & Spin Wheel Category Selection', 20, 54);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. Selection: Teams spin slot machine reel to select topics & points.', 20, 62);
docPlayer.text('b. Multiple choice options presented on screen for active team.', 20, 68);
docPlayer.text('c. Variable points range from 10 to 50 based on difficulty.', 20, 74);

// Section 5
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 102, 182, 50, 3, 3, 'F');
docPlayer.setTextColor(231, 111, 81);
docPlayer.setFontSize(12);
docPlayer.text('5. Round 4: Rapid Lockout Buzzer Round', 20, 112);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. First team to hit buzzer locks out rival teams.', 20, 120);
docPlayer.text('b. Locked-in team has 5 seconds to announce answer.', 20, 126);
docPlayer.text('c. Correct answer awards points; incorrect penalizes score.', 20, 132);

// Section 6 & 7
docPlayer.setFillColor(28, 105, 95);
docPlayer.roundedRect(14, 160, 182, 55, 3, 3, 'F');
docPlayer.setTextColor(46, 204, 113);
docPlayer.setFontSize(12);
docPlayer.text('6. Tournament Scoring & Championship Victory', 20, 170);
docPlayer.setFontSize(9);
docPlayer.setTextColor(255, 255, 255);
docPlayer.text('a. Highest aggregate score at end of final round wins inQUIZitive.', 20, 178);
docPlayer.text('b. Sudden-Death Tiebreaker: Tic-Tac-Toe 3x3 interactive grid duel.', 20, 184);

docPlayer.setFontSize(8);
docPlayer.setTextColor(244, 162, 97);
docPlayer.text('inQUIZitive - Stage Mechanics & Championship Rules', 14, 285);
docPlayer.text('Page 2 of 2', 180, 285);

const bufferPlayer = Buffer.from(docPlayer.output('arraybuffer'));
fs.writeFileSync(path.join(publicDir, 'inQUIZitive_Player_Rules.pdf'), bufferPlayer);


// 2. Generate Host Technical Manual PDF
const docHost = new jsPDF('p', 'mm', 'a4');
docHost.setFillColor(38, 70, 83);
docHost.rect(0, 0, 210, 297, 'F');

docHost.setTextColor(233, 196, 106);
docHost.setFontSize(22);
docHost.text('INQUIZITIVE', 14, 22);

docHost.setFontSize(14);
docHost.setTextColor(244, 162, 97);
docHost.text('Host Technical Operating Manual — Part 1', 14, 30);
docHost.setDrawColor(42, 157, 143);
docHost.line(14, 36, 196, 36);

// Module 1
docHost.setFillColor(28, 105, 95);
docHost.roundedRect(14, 44, 182, 55, 3, 3, 'F');
docHost.setTextColor(233, 196, 106);
docHost.setFontSize(12);
docHost.text('1. Stage Display & Stealth Broadcast Architecture', 20, 54);
docHost.setFontSize(9);
docHost.setTextColor(255, 255, 255);
docHost.text('• Stealth Mode (H): Fades admin controls down to 8% opacity.', 20, 62);
docHost.text('• Fullscreen Projection (F): Press F for native full-screen presentation.', 20, 68);
docHost.text('• 100% Offline PWA & Web Audio Engine: Synthesizes sound FX. Press M to mute.', 20, 74);

// Module 2 Table
docHost.setFillColor(28, 105, 95);
docHost.roundedRect(14, 108, 182, 120, 3, 3, 'F');
docHost.setTextColor(42, 157, 143);
docHost.setFontSize(12);
docHost.text('2. Master Presenter Keyboard Hotkeys Matrix', 20, 118);

docHost.setFontSize(9);
docHost.setTextColor(233, 196, 106);
docHost.text('Shortcut', 22, 128);
docHost.text('Stage Function', 70, 128);

docHost.setTextColor(255, 255, 255);
docHost.text('1 - 4 / A - D', 22, 138);
docHost.text('Quick select option choice A, B, C, or D', 70, 138);

docHost.text('Spacebar', 22, 148);
docHost.text('Master reveal answer key / advance question step', 70, 148);

docHost.text('Ctrl + Z / Cmd + Z', 22, 158);
docHost.text('Global Undo Stack (revert accidental score edits)', 70, 158);

docHost.text('+ / =', 22, 168);
docHost.text('Inject emergency +5s time buffer during disruptions', 70, 168);

docHost.text('P / K', 22, 178);
docHost.text('Pause or resume active countdown timer', 70, 178);

docHost.text('H / F / M', 22, 188);
docHost.text('Toggle Stealth (H), Fullscreen (F), Mute Audio (M)', 70, 188);

docHost.text('Escape', 22, 198);
docHost.text('Return to Main Menu screen', 70, 198);

docHost.setFontSize(8);
docHost.setTextColor(244, 162, 97);
docHost.text('inQUIZitive - Host Manual (Broadcast & Hotkeys)', 14, 285);
docHost.text('Page 1 of 2', 180, 285);

// Host Page 2
docHost.addPage();
docHost.setFillColor(38, 70, 83);
docHost.rect(0, 0, 210, 297, 'F');

docHost.setTextColor(233, 196, 106);
docHost.setFontSize(22);
docHost.text('INQUIZITIVE', 14, 22);

docHost.setFontSize(14);
docHost.setTextColor(244, 162, 97);
docHost.text('Host Technical Operating Manual — Part 2', 14, 30);
docHost.setDrawColor(42, 157, 143);
docHost.line(14, 36, 196, 36);

// Module 3
docHost.setFillColor(28, 105, 95);
docHost.roundedRect(14, 44, 182, 60, 3, 3, 'F');
docHost.setTextColor(244, 162, 97);
docHost.setFontSize(12);
docHost.text('3. Pre-Flight Audit Engine & Question Ingestion', 20, 54);
docHost.setFontSize(9);
docHost.setTextColor(255, 255, 255);
docHost.text('• Automated Integrity Checks: Detects missing options, duplicate questions, placeholders.', 20, 62);
docHost.text('• 1-Click Auto-Fix Engine: Automatically repairs spacing and fills default scores.', 20, 68);
docHost.text('• Question Bank Editor: Edit choices, answer flags, and category metadata in real time.', 20, 74);

// Module 4
docHost.setFillColor(28, 105, 95);
docHost.roundedRect(14, 112, 182, 60, 3, 3, 'F');
docHost.setTextColor(46, 204, 113);
docHost.setFontSize(12);
docHost.text('4. Scoreboard Overrides & Sudden-Death Duel', 20, 122);
docHost.setFontSize(9);
docHost.setTextColor(255, 255, 255);
docHost.text('• Live Score Tallying & Zero Resets: Standings update dynamically after questions.', 20, 130);
docHost.text('• Manual Score Override Dialog: Click team score card to adjust points with reason log.', 20, 136);
docHost.text('• Sudden-Death 3x3 Grid Duel: Launch Tic-Tac-Toe duel for draws.', 20, 142);

docHost.setFontSize(8);
docHost.setTextColor(244, 162, 97);
docHost.text('inQUIZitive - Host Manual (Audit Engine & Overrides)', 14, 285);
docHost.text('Page 2 of 2', 180, 285);

const bufferHost = Buffer.from(docHost.output('arraybuffer'));
fs.writeFileSync(path.join(publicDir, 'inQUIZitive_Host_Manual.pdf'), bufferHost);

console.log('Successfully generated public/inQUIZitive_Player_Rules.pdf and public/inQUIZitive_Host_Manual.pdf');
