#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuration des variables d\'environnement Supabase pour SenAlert\n');

console.log('📋 Instructions :');
console.log('1. Allez sur https://supabase.com/dashboard');
console.log('2. Sélectionnez votre projet SenAlert');
console.log('3. Allez dans Settings > API');
console.log('4. Copiez "Project URL" et "anon public"\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnv() {
  try {
    const supabaseUrl = await question('🔗 Project URL (ex: https://abcdefghijklmnop.supabase.co): ');
    const supabaseKey = await question('🔑 anon public key (commence par eyJ...): ');

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Les deux valeurs sont requises');
      rl.close();
      return;
    }

    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      console.log('❌ URL Supabase invalide. Doit commencer par https:// et contenir .supabase.co');
      rl.close();
      return;
    }

    if (!supabaseKey.startsWith('eyJ')) {
      console.log('❌ Clé Supabase invalide. Doit commencer par eyJ');
      rl.close();
      return;
    }

    const envContent = `# Configuration Supabase pour SenAlert
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}
`;

    const envPath = path.join(process.cwd(), '.env.local');
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Fichier .env.local créé avec succès !');
    console.log('📍 Emplacement:', envPath);
    console.log('\n🔄 Redémarrez votre serveur de développement :');
    console.log('   npm run dev');
    console.log('   ou');
    console.log('   yarn dev');
    console.log('   ou');
    console.log('   bun dev');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier:', error.message);
  } finally {
    rl.close();
  }
}

setupEnv(); 