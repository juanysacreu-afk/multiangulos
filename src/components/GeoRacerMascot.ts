import * as THREE from 'three';

export class GeoRacerMascot {
  public group: THREE.Group;
  private head: THREE.Group;
  private hoverboard: THREE.Group;
  private thrusterL: THREE.Mesh;
  private thrusterR: THREE.Mesh;
  private shieldBubble: THREE.Mesh;
  private chestSymbol: THREE.Mesh;
  private time: number = 0;
  private isShieldActive: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'GeoRacer_Character';

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sky Blue
      roughness: 0.25,
      metalness: 0.6,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
    });

    const darkAccentMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Titanium
      roughness: 0.2,
      metalness: 0.8,
    });

    const glowNeonMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Bright Cyan
    });

    const glowGoldMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24, // Bright Gold
    });

    const thrusterFireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan fire
      transparent: true,
      opacity: 0.85,
    });

    // 1. Hoverboard Base
    this.hoverboard = new THREE.Group();
    const boardGeo = new THREE.BoxGeometry(1.4, 0.15, 2.2);
    const boardMesh = new THREE.Mesh(boardGeo, darkAccentMat);
    this.hoverboard.add(boardMesh);

    // Board Rim Lights
    const rimL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.0), glowNeonMat);
    rimL.position.set(-0.68, 0.05, 0);
    this.hoverboard.add(rimL);

    const rimR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.0), glowNeonMat);
    rimR.position.set(0.68, 0.05, 0);
    this.hoverboard.add(rimR);

    // Thrusters under board
    const thrusterGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.4, 16);
    this.thrusterL = new THREE.Mesh(thrusterGeo, thrusterFireMat);
    this.thrusterL.position.set(-0.45, -0.22, 0.7);
    this.hoverboard.add(this.thrusterL);

    this.thrusterR = new THREE.Mesh(thrusterGeo, thrusterFireMat);
    this.thrusterR.position.set(0.45, -0.22, 0.7);
    this.hoverboard.add(this.thrusterR);

    this.hoverboard.position.y = 0.35;
    this.group.add(this.hoverboard);

    // 2. Character Torso
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.32, 0.75, 24);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.position.y = 1.0;
    this.group.add(torso);

    // Belt
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 12, 28), darkAccentMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.88;
    this.group.add(belt);

    // Chest Geometric Emblem (90° Angle Square Symbol)
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.06), darkAccentMat);
    chestPlate.position.set(0, 1.05, 0.38);
    this.group.add(chestPlate);

    const squareAngleGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04);
    this.chestSymbol = new THREE.Mesh(squareAngleGeo, glowGoldMat);
    this.chestSymbol.position.set(0, 1.05, 0.42);
    this.group.add(this.chestSymbol);

    // 3. Head & Visor
    this.head = new THREE.Group();
    this.head.position.y = 1.6;

    const headGeo = new THREE.SphereGeometry(0.4, 24, 20);
    headGeo.scale(1.05, 0.95, 1.0);
    const headMesh = new THREE.Mesh(headGeo, whiteMat);
    this.head.add(headMesh);

    // Visor with glowing eyes
    const visorGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 24, 1, false, -Math.PI / 2.5, Math.PI / 1.25);
    const visor = new THREE.Mesh(visorGeo, darkAccentMat);
    visor.position.set(0, 0.02, 0.12);
    this.head.add(visor);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, glowNeonMat);
    leftEye.position.set(-0.14, 0.02, 0.4);
    this.head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, glowNeonMat);
    rightEye.position.set(0.14, 0.02, 0.4);
    this.head.add(rightEye);

    this.group.add(this.head);

    // 4. Arms
    const armGeo = new THREE.CapsuleGeometry(0.1, 0.35, 8, 12);
    const leftArm = new THREE.Mesh(armGeo, bodyMat);
    leftArm.position.set(-0.52, 0.95, 0);
    leftArm.rotation.z = Math.PI / 8;
    this.group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, bodyMat);
    rightArm.position.set(0.52, 0.95, 0);
    rightArm.rotation.z = -Math.PI / 8;
    this.group.add(rightArm);

    // 5. Shield Bubble (Pulsing protective energy dome)
    const shieldGeo = new THREE.SphereGeometry(1.6, 24, 20);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      wireframe: true,
    });
    this.shieldBubble = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldBubble.position.y = 1.1;
    this.group.add(this.shieldBubble);

    // Overall scale suitable for 3 lanes
    this.group.scale.set(0.9, 0.9, 0.9);
  }

  public update(delta: number, bankAngle: number = 0) {
    this.time += delta * 6;

    // Gentle hoverboard bobbing
    const floatOffset = Math.sin(this.time) * 0.08;
    this.hoverboard.position.y = 0.35 + floatOffset;

    // Thruster pulse
    const flameScale = 1 + Math.sin(this.time * 2) * 0.25;
    this.thrusterL.scale.set(1, flameScale, 1);
    this.thrusterR.scale.set(1, flameScale, 1);

    // Banking when turning
    this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, -bankAngle * 0.35, 0.15);
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, bankAngle * 0.2, 0.15);

    // Shield effect animation
    if (this.isShieldActive) {
      const shieldMat = this.shieldBubble.material as THREE.MeshBasicMaterial;
      shieldMat.opacity = 0.35 + Math.sin(this.time * 3) * 0.15;
      this.shieldBubble.rotation.y += delta * 2;
    }
  }

  public triggerShield(durationMs: number = 1800) {
    this.isShieldActive = true;
    setTimeout(() => {
      this.isShieldActive = false;
      const shieldMat = this.shieldBubble.material as THREE.MeshBasicMaterial;
      shieldMat.opacity = 0.0;
    }, durationMs);
  }
}
