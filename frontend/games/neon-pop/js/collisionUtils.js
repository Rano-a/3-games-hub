/**
 * Utilitaires de détection de collisions
 */

/**
 * Détection de collision entre deux cercles.
 * @param {number} x1 - Position X du premier cercle
 * @param {number} y1 - Position Y du premier cercle
 * @param {number} r1 - Rayon du premier cercle
 * @param {number} x2 - Position X du deuxième cercle
 * @param {number} y2 - Position Y du deuxième cercle
 * @param {number} r2 - Rayon du deuxième cercle
 * @returns {boolean} true si collision détectée
 */
function circleCollide(x1, y1, r1, x2, y2, r2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return dx * dx + dy * dy < (r1 + r2) * (r1 + r2);
}

/**
 * Calcule la distance entre deux points.
 */
function distance(x1, y1, x2, y2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export { circleCollide, distance };
