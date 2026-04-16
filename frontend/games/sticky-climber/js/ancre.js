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

    let couleur = this.type === "mobile" ? "#ff8800" : this.type === "ephemere" ? "#00e5ff" : "#ffd700";

    ctx.shadowBlur = 22;
    ctx.shadowColor = couleur;

    // Halo externe
    ctx.fillStyle = couleur.replace(")", ", 0.15)").replace("rgb", "rgba");
    let gradient = ctx.createRadialGradient(0, 0, this.rayon * 0.5, 0, 0, this.rayon * 1.8);
    gradient.addColorStop(0, couleur + "44");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon * 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Corps principal
    let grad = ctx.createRadialGradient(-this.rayon * 0.3, -this.rayon * 0.3, 0, 0, 0, this.rayon);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, couleur);
    grad.addColorStop(1, this.type === "mobile" ? "#cc5500" : this.type === "ephemere" ? "#0088aa" : "#b8860b");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon, 0, Math.PI * 2);
    ctx.fill();

    // Anneau externe
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Croix centrale
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
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
