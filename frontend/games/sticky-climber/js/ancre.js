export default class Ancre {
  constructor(x, y, type = "fixe", rayon = 18) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.rayon = rayon;
    this.terminee = false;

    // Mobile : oscillation horizontale
    this.debutX = x;
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = 55 + Math.random() * 55;
    this.vitesseOscillation = 0.018 + Math.random() * 0.018;

    // Éphémère : durée de vie en ms
    this.dureeVie = 4500 + Math.random() * 2000;
    this.ageMs = 0;
  }

  update(deltaMs, largeur) {
    if (this.type === "mobile") {
      this.phase += this.vitesseOscillation;
      this.x = this.debutX + Math.sin(this.phase) * this.amplitude;
      this.x = Math.max(this.rayon + 10, Math.min(largeur - this.rayon - 10, this.x));
    }
    if (this.type === "ephemere") {
      this.ageMs += deltaMs;
      if (this.ageMs >= this.dureeVie) this.terminee = true;
    }
  }

  draw(ctx, offsetY) {
    let sy = this.y - offsetY;
    if (sy < -this.rayon - 5 || sy > ctx.canvas.height + this.rayon + 5) return;

    ctx.save();
    ctx.translate(this.x, sy);

    // Clignotement si éphémère sur le point de disparaître
    if (this.type === "ephemere") {
      let ratio = this.ageMs / this.dureeVie;
      if (ratio > 0.6) {
        ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(((ratio - 0.6) / 0.4) * Math.PI * 9));
      }
    }

    let couleur = this.type === "mobile" ? "#ff8800" : this.type === "ephemere" ? "#00c8f0" : "#e8c000";

    // Halo coloré
    let gradient = ctx.createRadialGradient(0, 0, this.rayon * 0.5, 0, 0, this.rayon * 1.8);
    gradient.addColorStop(0, couleur + "50");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Ombre portée pour la profondeur
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";

    // Corps principal
    let grad = ctx.createRadialGradient(-this.rayon * 0.3, -this.rayon * 0.3, 0, 0, 0, this.rayon);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, couleur);
    grad.addColorStop(1, this.type === "mobile" ? "#cc5500" : this.type === "ephemere" ? "#007799" : "#a07800");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon, 0, Math.PI * 2);
    ctx.fill();

    // Contour sombre (lisibilité sur fond clair)
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Croix centrale
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-this.rayon * 0.45, 0);
    ctx.lineTo(this.rayon * 0.45, 0);
    ctx.moveTo(0, -this.rayon * 0.45);
    ctx.lineTo(0, this.rayon * 0.45);
    ctx.stroke();

    ctx.restore();
  }
}
