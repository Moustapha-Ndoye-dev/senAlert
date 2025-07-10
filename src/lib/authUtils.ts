// Fonction pour générer des caractères alphanumériques aléatoires
export const generateRandomChars = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fonction pour vérifier si un code existe déjà
export const isCodeExists = (code: string): boolean => {
  const authCodes = JSON.parse(localStorage.getItem('auth_codes') || '{}');
  return authCodes.hasOwnProperty(code);
};

// Fonction pour générer un code d'authentification unique
export const generateAuthCode = (): string => {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100; // Éviter une boucle infinie
  
  do {
    // Générer un code de 8 caractères alphanumériques
    code = generateRandomChars(8);
    attempts++;
    
    // Si trop d'essais, ajouter un timestamp pour garantir l'unicité
    if (attempts >= maxAttempts) {
      const timestamp = Date.now().toString().slice(-4);
      code = generateRandomChars(4) + timestamp;
      break;
    }
  } while (isCodeExists(code));
  
  return code;
};

// Fonction pour valider un code d'authentification
export const validateAuthCode = (code: string): { isValid: boolean; error?: string } => {
  const cleanCode = code.replace(/\s/g, '').toUpperCase();
  
  // Vérifier la longueur (8 caractères alphanumériques)
  if (cleanCode.length !== 8) {
    return { isValid: false, error: 'Le code doit contenir exactement 8 caractères alphanumériques' };
  }
  
  // Vérifier que tous les caractères sont alphanumériques
  if (!/^[A-Z0-9]{8}$/.test(cleanCode)) {
    return { isValid: false, error: 'Le code doit contenir uniquement des lettres et chiffres' };
  }
  
  return { isValid: true };
};

// Fonction pour stocker un code d'authentification
export const storeAuthCode = (code: string, userId: string): void => {
  const authCodes = JSON.parse(localStorage.getItem('auth_codes') || '{}');
  authCodes[code] = {
    userId,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem('auth_codes', JSON.stringify(authCodes));
};

// Fonction pour vérifier si un code existe
export const verifyAuthCode = (code: string): { exists: boolean; userId?: string } => {
  const authCodes = JSON.parse(localStorage.getItem('auth_codes') || '{}');
  const authData = authCodes[code];
  
  if (!authData) {
    return { exists: false };
  }
  
  return {
    exists: true,
    userId: authData.userId
  };
}; 