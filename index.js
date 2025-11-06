// Respect the hard work - KING-M by Makamesco Digital 💫

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { spawn } = require('child_process');
const chalk = require('chalk');

const TEMP_DIR = path.join(__dirname, '.cache', 'kingm');
const ZIP_PATH = path.join(TEMP_DIR, 'repo.zip');
const EXTRACT_DIR = path.join(TEMP_DIR, 'King-M-main');

async function downloadRepo() {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      console.log(chalk.yellow('🧹 Cleaning old cache...'));
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    fs.mkdirSync(TEMP_DIR, { recursive: true });

    console.log(chalk.blue('⬇️ Fetching latest KING-M from GitHub...'));

    const response = await axios({
      url: 'https://github.com/sesco001/King-M/archive/refs/heads/main.zip',
      method: 'GET',
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(ZIP_PATH);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(chalk.green('📦 Download complete. Extracting...'));

    const zip = new AdmZip(ZIP_PATH);
    zip.extractAllTo(TEMP_DIR, true);

    console.log(chalk.green(`📂 Extracted successfully to: ${EXTRACT_DIR}`));

    fs.unlinkSync(ZIP_PATH); // Clean ZIP
  } catch (error) {
    console.error(chalk.red('❌ Failed to download or extract repo:'), error);
    process.exit(1);
  }
}

function startKingM() {
  const mainScript = path.join(EXTRACT_DIR, 'index.js');

  if (!fs.existsSync(mainScript)) {
    console.error(chalk.red('❌ index.js not found in extracted repo.'));
    process.exit(1);
  }

  console.log(chalk.cyan('🚀 Starting KING-M WhatsApp Manager...'));

  const botProcess = spawn('node', [mainScript], {
    cwd: EXTRACT_DIR,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  botProcess.on('close', (code) => {
    console.log(chalk.red(`💥 KING-M stopped with exit code: ${code}`));
  });

  botProcess.on('error', (err) => {
    console.error(chalk.red('❌ Failed to start KING-M:'), err);
  });
}

(async () => {
  await downloadRepo();
  startKingM();
})();
